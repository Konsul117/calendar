(function($) {

	/**
	 * @typedef {object} CalendarEvent
	 *
	 * @description Объект события
	 *
	 * @property {int} id Идентификатор события
	 * @property {moment} startDate Дата-время начала события
	 * @property {moment} endDate Дата-время окончания события
	 * @property {moment} realEndDate Дата-время фактического окончания события
	 * @property {string} title Название событи
	 * @property {string} description Описание события
	 * @property {bool} isCompleted Событие завершено
	 */

	/**
	 * @typedef {object} CalendarPluginEvent
	 *
	 * @description Объект события для плагина календаря
	 *
	 * @property {int} id Идентификатор события
	 * @property {string} title Название событи
	 * @property {moment} start Дата-время начала события
	 * @property {moment} end Дата-время окончания события
	 * @property {String} className CSS-класс
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
	var LOADING_BUTTON_CLASS = 'btn-loading';
	var LOCAL_TIMEZONE = 'local';
	var ACTION_RENDER_EVENT = 'renderEvent';
	var ACTION_REMOVE_EVENTS = 'removeEvents';
	var DATETIME_FORMAT = 'YYYY.MM.DD HH:mm:ss';
	var DATETIME_OUT_FORMAT = 'DD.MM.YYYY HH:mm:ss';
	var LOAD_EVENTS_URL = 'calendar/load-events/';
	var EDIT_EVENT_URL = 'calendar/edit-event/';
	var DELETE_EVENT_URL = 'calendar/delete-event/';

	var EVENT_CLASS_NEW = 'event-is-new';
	var EVENT_CLASS_OVERDUE = 'event-is-overdue';
	var EVENT_CLASS_COMPLETED = 'event-is-completed';

	var activeEvent = null;

	/**
	 * Html-код индикации загрузки для кнопки
	 * @type {string}
	 */
	var BUTTON_LOADING_ANIM_HTML = '<div id="fountainG">'
		+ '<div id="fountainG_1" class="fountainG"></div>'
		+ '<div id="fountainG_2" class="fountainG"></div>'
		+ '<div id="fountainG_3" class="fountainG"></div>'
		+ '<div id="fountainG_4" class="fountainG"></div>'
		+ '<div id="fountainG_5" class="fountainG"></div>'
		+ '<div id="fountainG_6" class="fountainG"></div>'
		+ '<div id="fountainG_7" class="fountainG"></div>'
		+ '<div id="fountainG_8" class="fountainG"></div>'
		+ '</div>';

	/**
	 * Селектор для блока анимации у кнопки
	 * @type {string}
	 */
	var BUTTON_LOADING_ANIM_SELECTOR = '.fountainG';

	/**
	 * Параметры просмотра.
	 *
	 * @type {{view: string, defaultDate: hooks}}
	 */
	var viewOptions = {
		view:        'month',
		defaultDate: new moment()
	};

	var COOKIE_VIEW_OPTIONS = 'calendarViewOptions';

	var methods = {
		init: function() {
			methods.loadSession();
			$panel = $(this).find('div[data-role=calendar-panel]');

			/**
			 * Функция изменения события мышью
			 * @param {CalendarPluginEvent} calendarEvent
			 */
			var mouseChangeEvent = function(calendarEvent) {
				var event = loadedEvents[calendarEvent.id];

				event.startDate = calendarEvent.start;
				event.endDate = calendarEvent.end;

				methods.indicateLoading(true);
				methods.apiSaveEvent(event, function() {
					methods.actualizeEvent(event, calendarEvent);
					methods.indicateLoading(false);
				});
			};

			$panel.fullCalendar({
				header:     {
					left:   'prev,next today',
					center: 'title',
					right:  'month,agendaWeek,agendaDay'
				},
				timezone:   LOCAL_TIMEZONE,
				editable:   true,
				selectable: true,
				eventClick: function(calEvent) {
					activeEvent = calEvent;
					methods.viewEvent(calEvent.id);
				},
				eventDrop: mouseChangeEvent,
				eventResize: mouseChangeEvent,
				defaultView: viewOptions.view,
				defaultDate: viewOptions.defaultDate,
				viewRender: function(view) {
					methods.calendarChangeView(view);

					viewOptions.view = view.name;
					viewOptions.defaultDate = view.intervalStart;
					methods.saveSesion();
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

		/**
		 * Загрузить параметры просмотра из сессии.
		 */
		loadSession: function() {
			var loadedData = Cookies.getJSON(COOKIE_VIEW_OPTIONS);
			if (loadedData !== undefined) {
				viewOptions = loadedData;
			}
		},

		/**
		 * Сохранить параметры просмотра в сессию.
		 */
		saveSesion: function() {
			Cookies.set(COOKIE_VIEW_OPTIONS, viewOptions, {expires: 365});
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
		 * Расстановка событий в календаре.
		 *
		 * @param {bool} success
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
					 * @property {CalendarEvent[]}                  data                Данные, которые вернул сервер
					 * @property {string}                           message             Текст сообщения для пользователя
					 */

					/**
					 * @typedef {object} EventResponse
					 *
					 * @property {string} title
					 * @property {string} dateStart
					 * @property {string} dateEnd
					 */

					if (response.success) {

						for (var i = 0; i < response.data.length; i++) {
							var item = response.data[i];

							loadedEvents[item.id] = {
								id:          item.id,
								startDate:   (new moment(item.startDate, DATETIME_OUT_FORMAT)),
								endDate:     (new moment(item.endDate, DATETIME_OUT_FORMAT)),
								realEndDate: (new moment(item.realEndDate, DATETIME_OUT_FORMAT)),
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
				});

			$addModal.modal();

			//обрабатываем событие клика на кнопке "Сохранить"
			$addModal.find('button.btn-success').click(function() {
				//сохраняем jquery-объект кнопки
				var $button = $(this);

				//переключаем состояние кнопки на загрузку
				methods.buttonSwitchLoading($button, true);

				var $form = $addModal.find('form');

				var eventId = $addModal.find('[data-field=id]').val();

				/** @type {CalendarEvent} */
				var event = {};

				if (eventId) {
					event = loadedEvents[eventId];
				}

				/** @param {boolean} isCompletedBefore Было ли событие завершено до обновления данных из формы */
				var isCompletedBefore = event.isCompleted;

				event.startDate = new moment($form.find('[data-field=startDate]').val(), DATETIME_OUT_FORMAT);
				event.endDate = new moment($form.find('[data-field=endDate]').val(), DATETIME_OUT_FORMAT);
				event.title = $form.find('[data-field=title]').val();
				event.description = $form.find('[data-field=description]').val();
				event.isCompleted = $form.find('[data-field=isCompleted]').prop('checked');

				//если событие стало завершено, то проставляем дату фактического завершения
				if (isCompletedBefore !== undefined && event.isCompleted && isCompletedBefore !== event.isCompleted) {
					event.realEndDate = new moment();
				}

				if (event.realEndDate === undefined) {
					event.realEndDate = new moment(null);
				}

				methods.apiSaveEvent(event, function(success) {
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

					//выключаем у кнопки состояние загрузки
					methods.buttonSwitchLoading($button, false);
				});

				return false;

			});
		},

		/**
		 * Сохранение события на сервере через api.
		 *
		 * @param {CalendarEvent} event Событие
		 * @param {function} finishCallback Коллбэк-функция, вызываемя после завершения операции.
		 */
		apiSaveEvent: function(event, finishCallback) {
			var data = {
				id:          event.id,
				startDate:   methods.dateConvertToOut(event.startDate),
				endDate:     methods.dateConvertToOut(event.endDate),
				title:       event.title,
				description: event.description,
				isCompleted: event.isCompleted ? 1 : 0
			};

			if (event.realEndDate.isValid() === false) {
				data.realEndDate = null;
			}
			else {
				data.realEndDate = methods.dateConvertToOut(event.realEndDate);
			}

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

		/**
		 * Удаление события на сервере через api.
		 *
		 * @param {CalendarEvent} event Событие
		 * @param {function} finishCallback Коллбэк-функция, вызываемя после завершения операции.
		 */
		apiDeleteEvent: function(event, finishCallback) {
			$.ajax({
				method:  'post',
				data:    {'event_id': event.id},
				url:     DELETE_EVENT_URL,
				success: function(response) {
					/** @param {loadEventsResponse} response */
					if (!response.success) {
						if (response.message) {
							alert('Ошибка при удалении события: '+response.message);
						}
						else {
							alert('Неизвестная ошибка при удалении события.');
						}
					}

					finishCallback(response.success);

				},
				error:   function() {
					alert('Произошла ошибка при удалении события');
					finishCallback(false);
				}
			});
		},

		actualizeEvent: function(event, calendarEvent) {
			methods.bindCalendarEvent(event, calendarEvent);

			$panel.fullCalendar('updateEvent', calendarEvent);
		},

		/**
		 *
		 * @param {CalendarEvent} event
		 * @param {CalendarPluginEvent} calendarPluginEvent
		 */
		bindCalendarEvent: function(event, calendarPluginEvent) {
			calendarPluginEvent.id = event.id;
			calendarPluginEvent.start = event.startDate;
			calendarPluginEvent.end = event.endDate;
			calendarPluginEvent.title = event.title;

			var eventClass = '';

			var currentMoment = new moment();

			if (event.isCompleted) {
				eventClass = EVENT_CLASS_COMPLETED;
			}
			else if (event.startDate < currentMoment && event.endDate < currentMoment) {
				eventClass = EVENT_CLASS_OVERDUE;
			}
			else {
				eventClass = EVENT_CLASS_NEW;
			}

			calendarPluginEvent.className = eventClass;
		},

		viewEvent: function(eventId) {

			var event = loadedEvents[eventId];

			var buttons = [];

			if (!event.isCompleted) {
				buttons.push({
					type: 'success',
					title: 'Завершить'
				});
			}

			buttons.push({
				type: 'info',
				title: 'Правка'
			});

			buttons.push({
				type: 'danger',
				title: 'Удалить'
			});

			buttons.push({
				type: 'default',
				title: 'Закрыть'
			});

			var $currentModal = methods.wrapModal(event.title, $viewModal.html(), buttons);

			$currentModal.find('[data-field=startDate] [data-role=event-row-value]').text(methods.dateConvertToOut(event.startDate));
			$currentModal.find('[data-field=endDate] [data-role=event-row-value]').text(methods.dateConvertToOut(event.endDate));
			$currentModal.find('[data-field=realEndDate] [data-role=event-row-value]').text(methods.dateConvertToOut(event.realEndDate));
			$currentModal.find('[data-field=description] [data-role=event-row-value]').html(event.description.replace(/\n/g, '<br/>'));
			$currentModal.find('[data-field=isCompleted] [data-role=event-row-value]').html(
				event.isCompleted ? ('<span class="glyphicon glyphicon-ok"></span>') : ''
			);

			$currentModal.modal();

			//обрабатываем событие клика на кнопке "Заврешить"
			$currentModal.find('button.btn-success').click(function() {
				//сохраняем jquery-объект кнопки
				var $button = $(this);

				//переключаем состояние кнопки на загрузку
				methods.buttonSwitchLoading($button, true);

				event.isCompleted = true;

				//проставляем дату фактического завершения
				event.realEndDate = new moment();

				methods.apiSaveEvent(event, function(success) {
					if (success) {
						methods.actualizeEvent(event, activeEvent);
						$currentModal.modal('hide');
					}

					//выключаем у кнопки состояние загрузки
					methods.buttonSwitchLoading($button, false);
				});

				return false;
			});

			//обрабатываем событие клика на кнопке "Удалить"
			$currentModal.find('button.btn-danger').click(function() {

				if (!confirm('Действительно удалить событие "' + event.title + '"?')) {
					return false;
				}

				//сохраняем jquery-объект кнопки
				var $button = $(this);

				//переключаем состояние кнопки на загрузку
				methods.buttonSwitchLoading($button, true);

				methods.apiDeleteEvent(event, function(success) {
					if (success) {
						$currentModal.modal('hide');

						delete loadedEvents[event.id];

						$panel.fullCalendar(ACTION_REMOVE_EVENTS, event.id);
					}

					//выключаем у кнопки состояние загрузки
					methods.buttonSwitchLoading($button, false);
				});

				return false;
			});

			//обрабатываем событие клика на кнопке "Правка"
			$currentModal.find('button.btn-info').click(function() {
				//вызываем окно редактирования события по триггеру закрытия текущего окна
				//чтобы новое окно открылось только после закрытия текущего
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
			if (date.isValid() === false) {
				return '-';
			}
			return date.format(DATETIME_OUT_FORMAT);
		},

		/**
		 * Сменить состояние загрузки у кнопки.
		 *
		 * @param {jQuery} $button Кнопка
		 * @param {boolean} state Состояние. true - загрузка, false - загрузка закончена.
		 */
		buttonSwitchLoading: function($button, state) {
			//переключаем css-класс в зависимости от состояния.
			$button.toggleClass(LOADING_BUTTON_CLASS, state);

			if (state) {
				//если идёт загрука
				//заменяем ширину и высоту на текущее значение
				$button.css('width', $button.outerWidth());
				$button.css('height', $button.outerHeight());

				//убираем текст (переносим в data-параметр)
				$button.data('text', $button.text());
				$button.text('');

				//добавляем html анимации
				$button.append(BUTTON_LOADING_ANIM_HTML);

				//и блокируем кнопку
				$button.prop('disabled', true);
			}
			else {
				//если загрузка закончена, то возвращаем кнопку к её первоначальному состоянию

				//удаляем анимацию
				$button.find(BUTTON_LOADING_ANIM_SELECTOR).remove();

				//возвращаем обратно текст
				$button.text($button.data('text'));
				$button.data('text', null);

				//возвращаем обратно ширину и высоту, выставляемую автоматически
				$button.css('width', 'auto');
				$button.css('height', 'auto');

				//разблокируем кнопку
				$button.prop('disabled', false);
			}
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