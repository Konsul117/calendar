(function($) {

	/**
	 * @typedef {object} CalendarEvent
	 *
	 * @description Объект события
	 *
	 * @property {int} id
	 * @property {Date} start Дата-время события
	 * @property {string} title Название событи
	 */

	/**
	 * Панель календаря
	 * @type {jQuery}
	 */
	var $panel;
	var $editModal;

	var LOADING_INDICATOR_CLASS = 'loading-indicator';
	var LOCAL_TIMEZONE = 'local';
	var ACTION_RENDER_EVENT = 'renderEvent';
	var ACTION_REMOVE_EVENTS = 'removeEvents';
	var ACTION_GET_VIEW = 'getView';
	var DATETIME_FORMAT = 'YYYY.MM.DD HH:mm:ss';
	var LOAD_EVENTS_URL = 'calendar/load-events/';
	var EDIT_EVENT_URL = 'calendar/edit-event/';

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
				viewRender: methods.calendarChangeView
			});

			$panel.find('.fc-left').append(
				'<button class="btn btn-default" data-role="calendar-add-button">'
				+'Добавить'
				+'</button>'
			);

			$panel.find('button[data-role=calendar-add-button]').click(function() {
				methods.editEvent();
			});

			$editModal = $(this).find('div[data-role=calendar-add-modal]');
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
		 * @param {CalendarEvent[]} events
		 */
		setEvents: function(events) {
			$panel.fullCalendar(ACTION_REMOVE_EVENTS);

			$.each(events, function(key, event) {
				/** @param {CalendarEvent} event */

				$panel.fullCalendar(ACTION_RENDER_EVENT, event);
			})
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
							/** @type {CalendarEvent} ev */
							var ev = {
								start: item.dateStart,
								title: item.title
							};

							result.push(ev);
						}

						callback(result);
					}
					else {
						if (response.message) {
							alert('Ошибка при загрузке событий: '+response.message);
						}
						else {
							alert('Неизвестная ошибка при загрузке событий.');
						}
					}

					methods.indicateLoading(false);
				},
				error:   function() {
					alert('Произошла ошибка при загрузке данных');

					methods.indicateLoading(false);
				}
			});
		},

		editEvent: function() {
			var modalHtml =
				'<div class="modal fade add-image-modal" id="addImageModel" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'
				+'<div class="modal-dialog">'
				+'<div class="modal-content">'
				+'<div class="modal-header">'
				+'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
				+'<h4 class="modal-title" id="myModalLabel">Добавить изображение</h4>'
				+'</div>'
				+'<div class="modal-body">'

				+$editModal.html()
				+' <div class="modal-footer">'
				+'<button type="button" class="btn btn-success" data-dismiss="modal">Добавить</button>'
				+'<button type="button" class="btn btn-default" data-dismiss="modal">Отмена</button>'
				+' </div>'
				+'</div>'
				+'</div>'
				+'</div>';

			$addModal = $(modalHtml);

			$addModal.modal();

			$addModal.on('hidden.bs.modal', function() {
				$(this).remove();
			});

			$addModal.find('input[type=text]').keyup(function(event) {
				if (event.keyCode == 13) {
					$addModal.find('button.btn-success').click();
				}
			});

			$addModal.find('button.btn-success').click(function() {
				$.ajax({
					method:  'post',
					data:    $addModal.find('form').serialize(),
					url:     EDIT_EVENT_URL,
					success: function(response) {
						/** @param {loadEventsResponse} response */
						if (response.success) {
							$addModal.modal('hide');
							methods.calendarChangeView($panel.fullCalendar(ACTION_GET_VIEW));
						}
						else {
							if (response.message) {
								alert('Ошибка при загрузке событий: '+response.message);
							}
							else {
								alert('Неизвестная ошибка при загрузке событий.');
							}
						}

					},
					error:   function() {
						alert('Произошла ошибка при загрузке данных');

					}
				});

				return false;

			});
		},


		indicateLoading: function(state) {
			if (typeof(state) === 'undefined') {
				state = true;
			}

			$panel.toggleClass(LOADING_INDICATOR_CLASS, state);
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