(function($) {

	/**
	 * @typedef {object} CalendarEvent
	 *
	 * @description Объект события
	 *
	 * @property {int} id Идентификатор события
	 * @property {Date} startDate Дата-время начала события
	 * @property {Date} endDate Дата-время окончания события
	 * @property {string} title Название событи
	 * @property {string} description Описание события
	 * @property {bool} isCompleted Событие завершено
	 */

	/**
	 * Панель календаря
	 * @type {jQuery}
	 */
	var $panel;
	/**
	 * Модальное окно редактирования события
	 * @type {jQuery}
	 */
	var $editModal;

	/**
	 * Модальное окно редактирования события
	 * @type {jQuery}
	 */
	var $viewModal;

	/** @type CalendarEvent[] Загруженные события */
	var loadedEvents = [];

	var LOADING_INDICATOR_CLASS = 'loading-indicator';
	var LOCAL_TIMEZONE = 'local';
	var ACTION_RENDER_EVENT = 'renderEvent';
	var ACTION_REMOVE_EVENTS = 'removeEvents';
	var DATETIME_FORMAT = 'YYYY.MM.DD HH:mm:ss';
	var DATETIME_OUT_FORMAT = 'DD.MM.YYYY HH:mm:ss';
	var LOAD_EVENTS_URL = 'calendar/load-events/';
	var EDIT_EVENT_URL = 'calendar/edit-event/';

	var activeEvent = null;

	var methods = {
		init: function() {
			$panel = $(this).find('div[data-role=calendar-panel]');

			$panel.fullCalendar({
				header:     {
					left:   'prev,next today',
					center: 'title',
					right:  'month,agendaWeek,agendaDay'
				},
				timezone:   LOCAL_TIMEZONE,
				viewRender: methods.calendarChangeView,
				editable:   true,
				selectable: true,
				eventClick: function(calEvent) {
					activeEvent = calEvent;
					methods.viewEvent(calEvent.id);
				},
				eventDrop: function(calendarEvent) {
					var event = loadedEvents[calendarEvent.id];

					event.startDate = calendarEvent.start;
					event.endDate = calendarEvent.end;

					methods.indicateLoading(true);
					methods.saveEvent(event, function() {
						methods.indicateLoading(false);
					});
				},
				eventResize: function(calendarEvent) {
					var event = loadedEvents[calendarEvent.id];

					event.startDate = calendarEvent.start;
					event.endDate = calendarEvent.end;

					methods.indicateLoading(true);
					methods.saveEvent(event, function() {
						methods.indicateLoading(false);
					});
				}
			});

			$(window).resize(methods.resizeCalendarByWindow);

			methods.resizeCalendarByWindow();

			$panel.find('.fc-left').append(
				'<button class="btn btn-default" data-role="calendar-add-button">'
				+'Добавить'
				+'</button>'
			);

			$panel.find('button[data-role=calendar-add-button]').click(function() {
				activeEvent = null;
				methods.editEvent();
			});

			$editModal = $(this).find('div[data-role=calendar-add-modal]');
			$viewModal = $(this).find('div[data-role=calendar-view-modal]');
		},

		resizeCalendarByWindow: function() {
			$panel.fullCalendar('option', 'height', $('.main-container').height());
		},

		calendarChangeView: function(view) {
			methods.loadEvents(
				view.intervalStart,
				view.intervalEnd,
				/**
				 * @param {CalendarEvent[]} events
				 */
				function(events) {
					methods.setEvents(events);
				}
			);
		},

		/**
		 *
		 * @param {bool} events
		 */
		setEvents: function(success) {

			if (!success) {
				return ;
			}

			$panel.fullCalendar(ACTION_REMOVE_EVENTS);

			loadedEvents.forEach(function(event) {

				var calendarEvent = {};
				methods.bindCalendarEvent(event, calendarEvent);

				$panel.fullCalendar(ACTION_RENDER_EVENT, calendarEvent);
			});
		},

		/**
		 * Загрузка событий
		 *
		 * @param {Moment} from
		 * @param {Moment} to
		 * @param {function} callback
		 */
		loadEvents: function(from, to, callback) {
			methods.indicateLoading(true);
			$.ajax({
				method:  'get',
				data:    {from: from.format(DATETIME_FORMAT), to: to.format(DATETIME_FORMAT)},
				url:     LOAD_EVENTS_URL,
				success: function(response) {
					/** @param {loadEventsResponse} response */
					/**
					 * @typedef {object} loadEventsResponse
					 *
					 * @description Результат ответа от сервера.
					 *
					 * @property {boolean}                          success              Результат выполнения операции
					 * @property {EventResponse[]}                  data                Данные, которые вернул сервер
					 * @property {string}                           message             Текст сообщения для пользователя
					 */

					/**
					 * @typedef {object} EventResponse
					 *
					 * @property {string} title
					 * @property {string} dateStart
					 * @property {string} dateEnd
					 */

					/** @type {CalendarEvent[]} result */
					var result = [];
					if (response.success) {

						for (var i = 0; i < response.data.length; i++) {
							var item = response.data[i];

							loadedEvents[item.id] = {
								id:          item.id,
								startDate:   (new moment(item.startDate, DATETIME_OUT_FORMAT)),
								endDate:     (new moment(item.endDate, DATETIME_OUT_FORMAT)),
								title:       item.title,
								description: item.description,
								isCompleted: item.isCompleted
							};
						}


					}
					else {
						if (response.message) {
							alert('Ошибка при загрузке событий: '+response.message);
						}
						else {
							alert('Неизвестная ошибка при загрузке событий.');
						}
					}

					callback(response.success);

					methods.indicateLoading(false);
				},
				error:   function() {
					alert('Произошла ошибка при загрузке данных');

					methods.indicateLoading(false);

					callback(false);
				}
			});
		},

		editEvent: function(eventId) {

			var $addModal = methods.wrapModal('Редактирование события', $editModal.html(), [
				{
					type: 'success',
					title: 'Сохранить'
				},
				{
					type: 'default',
					title: 'Отмена'
				}
			]);

			if (typeof eventId !== 'undefined') {
				var event = loadedEvents[eventId];

				$addModal.find('[data-field=id]').val(event.id);
				$addModal.find('[data-field=startDate]').val(methods.dateConvertToOut(event.startDate));
				$addModal.find('[data-field=endDate]').val(methods.dateConvertToOut(event.endDate));
				$addModal.find('[data-field=title]').val(event.title);
				$addModal.find('[data-field=description]').val(event.description);
				$addModal.find('[data-field=isCompleted]').prop('checked', event.isCompleted);
			}

			$addModal.find('[data-role=datetimepicker]').datetimepicker()
				.on('dp.change', function(data) {

					if ($(this).data('field') === 'startDate') {
						$addModal.find('[data-role=datetimepicker][data-field=endDate]').datetimepicker().data('DateTimePicker')
							.minDate(data.date);

					}
					else if($(this).data('field') === 'endDate') {
						$addModal.find('[data-role=datetimepicker][data-field=startDate]').datetimepicker().data('DateTimePicker')
							.maxDate(data.date);
					}

				});

			$addModal.modal();
			$addModal.find('button.btn-success').click(function() {

				var $form = $addModal.find('form');

				var eventId = $addModal.find('[data-field=id]').val();

				if (eventId) {
					var event = loadedEvents[eventId];
				}
				else {
					var event = {};
				}

				event.startDate = new moment($form.find('[data-field=startDate]').val(), DATETIME_OUT_FORMAT);
				event.endDate = new moment($form.find('[data-field=endDate]').val(), DATETIME_OUT_FORMAT);
				event.title = $form.find('[data-field=title]').val();
				event.description = $form.find('[data-field=description]').val();
				event.isCompleted = $form.find('[data-field=isCompleted]').prop('checked');

				methods.saveEvent(event, function(success) {
					if (success) {

						if (activeEvent !== null) {
							methods.actualizeEvent(event, activeEvent);
						}
						else {
							var calendarEvent = {};
							methods.bindCalendarEvent(event, calendarEvent);
							$panel.fullCalendar(ACTION_RENDER_EVENT, calendarEvent);
						}

						if (loadedEvents[event.id] === undefined) {
							loadedEvents[event.id] = event;
						}

						$addModal.modal('hide');
					}
				});

				return false;

			});
		},

		saveEvent: function(event, finishCallback) {

			var data = {
				id:          event.id,
				startDate:   methods.dateConvertToOut(event.startDate),
				endDate:     methods.dateConvertToOut(event.endDate),
				title:       event.title,
				description: event.description,
				isCompleted: event.isCompleted
			};

			$.ajax({
				method:  'post',
				data:    data,
				url:     EDIT_EVENT_URL,
				success: function(response) {
					/** @param {loadEventsResponse} response */
					if (response.success) {
						event.id = response.data.id;
					}
					else {
						if (response.message) {
							alert('Ошибка при загрузке событий: '+response.message);
						}
						else {
							alert('Неизвестная ошибка при загрузке событий.');
						}
					}

					finishCallback(response.success);

				},
				error:   function() {
					alert('Произошла ошибка при загрузке данных');
					finishCallback(false);
				}
			});
		},

		actualizeEvent: function(event, calendarEvent) {
			methods.bindCalendarEvent(event, calendarEvent);

			$panel.fullCalendar('updateEvent', calendarEvent);
		},

		bindCalendarEvent: function(event, calendarEvent) {
			calendarEvent.id = event.id;
			calendarEvent.start = event.startDate;
			calendarEvent.end = event.endDate;
			calendarEvent.title = event.title;
		},

		viewEvent: function(eventId) {

			var event = loadedEvents[eventId];

			var $currentModal = methods.wrapModal(event.title, $viewModal.html(), [
				{
					type: 'default',
					title: 'Закрыть'
				},
				{
					type: 'info',
					title: 'Правка'
				}
			]);

			$currentModal.find('[data-field=startDate] [data-role=event-row-value]').text(methods.dateConvertToOut(event.startDate));
			$currentModal.find('[data-field=endDate] [data-role=event-row-value]').text(methods.dateConvertToOut(event.endDate));
			$currentModal.find('[data-field=description] [data-role=event-row-value]').text(event.description);
			$currentModal.find('[data-field=isCompleted] [data-role=event-row-value]').html(
				event.isCompleted ? ('<span class="glyphicon glyphicon-ok"></span>') : ''
			);

			$currentModal.modal();

			$currentModal.find('button.btn-info').click(function() {
				$currentModal.on('hidden.bs.modal', function() {
					methods.editEvent(event.id);
				});
			});
		},

		/**
		 * Завернуть в модальное окно
		 *
		 * @param {string} title
		 * @param {string} htmlContent
		 * @param {array} buttons
		 *
		 * @returns {jQuery}
		 */
		wrapModal: function(title, htmlContent, buttons) {
			var buttonsHtml = '';

			for (var i = 0; i < buttons.length; i++) {
				var button = buttons[i];

				buttonsHtml += '<button type="button" class="btn btn-'
					+ button.type
					+ '" data-dismiss="modal">' + button.title + '</button>';
			}

			var modalHtml =
				'<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'
				+'<div class="modal-dialog">'
				+'<div class="modal-content">'
				+'<div class="modal-header">'
				+'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
				+'<h4 class="modal-title" id="myModalLabel">' + title + '</h4>'
				+'</div>'
				+'<div class="modal-body">'

				+ htmlContent
				+' <div class="modal-footer">'
				+buttonsHtml
				+' </div>'
				+'</div>'
				+'</div>'
				+'</div>';

			var $modalHtml = $(modalHtml);

			$modalHtml.on('hidden.bs.modal', function() {
				$(this).remove();
			});

			$modalHtml.find('input[type=text]').keyup(function(event) {
				if (event.keyCode == 13) {
					$modalHtml.find('button.btn-success').click();
				}
			});

			return $modalHtml;
		},


		indicateLoading: function(state) {
			if (typeof(state) === 'undefined') {
				state = true;
			}

			$panel.toggleClass(LOADING_INDICATOR_CLASS, state);
		},

		dateConvertToOut: function(date) {
			return date.format(DATETIME_OUT_FORMAT);
		}
	};

	$.fn.appCalendar = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		}
	}

})(jQuery);

$("div[data-role=calendar-widget]").appCalendar();