<?php

namespace app\components;

use app\models\CalendarEvent;
use yii\base\InvalidParamException;
use yii\base\Model;

/**
 * Класс-обёртка для фронтэнда события календаря
 */
class CalendarEventFront extends Model {

	/** @var int Идентификатор события */
	public $id;

	/** @var string Дата-время начала события */
	public $startDate;

	/** @var string Дата-время окончания события */
	public $endDate;

	/** @var string Дата-время фактического окончания события */
	public $realEndDate;

	/** @var string Название события */
	public $title;

	/** @var string Описание события */
	public $description;

	/** @var bool Событие завершено */
	public $isCompleted;

	const ATTR_ID            = 'id';
	const ATTR_START_DATE    = 'startDate';
	const ATTR_END_DATE      = 'endDate';
	const ATTR_REAL_END_DATE = 'realEndDate';
	const ATTR_TITLE         = 'title';
	const ATTR_DESCRIPTION   = 'description';
	const ATTR_IS_COMPLETED  = 'isCompleted';

	/**
	 * Загрузка данных из модели события в БД
	 *
	 * @param CalendarEvent $model
	 */
	public function loadFromModel(CalendarEvent $model) {
		$utcZone           = new DateTimeZone('UTC');
		$localZone         = DateTimeZone::getDefault();

		$this->id          = $model->id;
		$this->startDate   = (new DateTime($model->start_date, $utcZone))
			->setTimezone($localZone)
			->format(DateTime::FRONT_OUT_FORMAT);

		$this->endDate     = (new DateTime($model->end_date, $utcZone))
			->setTimezone($localZone)
			->format(DateTime::FRONT_OUT_FORMAT);

		if (!$model->real_end_date) {
			$this->realEndDate = null;
		}
		else {
			$this->realEndDate = (new DateTime($model->real_end_date, $utcZone))
				->setTimezone($localZone)
				->format(DateTime::FRONT_OUT_FORMAT);
		}

		$this->title       = $model->title;
		$this->description = $model->description;
		$this->isCompleted = (bool)$model->is_completed;
	}

	/**
	 * @inheritdoc
	 */
	public function attributeLabels() {
		return [
			static::ATTR_START_DATE    => 'Начало',
			static::ATTR_END_DATE      => 'Конец',
			static::ATTR_REAL_END_DATE => 'Фактическое окончание',
			static::ATTR_TITLE         => 'Название',
			static::ATTR_DESCRIPTION   => 'Описание',
			static::ATTR_IS_COMPLETED  => 'Завершено',
		];
	}

	/**
	 * @inheritdoc
	 */
	public function scenarios() {
		return [
			static::SCENARIO_EDIT_EVENT => [
				static::ATTR_ID,
				static::ATTR_START_DATE,
				static::ATTR_END_DATE,
				static::ATTR_REAL_END_DATE,
				static::ATTR_TITLE,
				static::ATTR_DESCRIPTION,
				static::ATTR_IS_COMPLETED,
			],
		];
	}

	const SCENARIO_EDIT_EVENT = 'editEvent';

	/**
	 * Сохранение события в модель БД
	 *
	 * @throws InvalidParamException
	 *
	 * @return bool
	 */
	public function save() {
		if ($this->id) {
			/** @var CalendarEvent $model */
			$model = CalendarEvent::findOne($this->id);

			if ($model === null) {
				throw new InvalidParamException('Не удалось загрузить модель события из БД');
			}
		}
		else {
			$model = new CalendarEvent();
		}

		//создаём объекты для таймзон, с которыми работаем
		$utcZone   = new DateTimeZone('UTC');
		$localZone = DateTimeZone::getDefault();

		//создаём объекты дат
		$startDate   = DateTime::createFromAnyFormat($this->startDate, $localZone);
		$endDate     = DateTime::createFromAnyFormat($this->endDate, $localZone);
		$realEndDate = DateTime::createFromAnyFormat($this->realEndDate, $localZone);

		//переводим таймзоны даты в UTC и передаём в модель
		$model->start_date    = $startDate->setTimezone($utcZone)->format(DateTime::DB_FORMAT);
		$model->end_date      = $endDate->setTimezone($utcZone)->format(DateTime::DB_FORMAT);

		if ($realEndDate !== false) {
			$model->real_end_date = $realEndDate->setTimezone($utcZone)->format(DateTime::DB_FORMAT);
		}

		$model->title        = $this->title;
		$model->description  = $this->description;
		$model->is_completed = $this->isCompleted;

		if ($model->save()) {
			$this->id = $model->id;

			return true;
		}

		return false;
	}

	/**
	 * Загрузка событий по промежутку дат
	 *
	 * @param string $dateFrom Дата-время начала промежутка (таймзона локальная)
	 * @param string $dateTo   Дата-время окончания промежутка (таймзона локальная)
	 *
	 * @return static[]
	 */
	public static function loadEventsByInterval($dateFrom, $dateTo) {
		/** @var static[] $result */
		$result = [];

		//создаём объекты для таймзон, с которыми работаем
		$utcZone   = new DateTimeZone('UTC');
		$localZone = DateTimeZone::getDefault();

		//создаём объекты дат
		$startDate = DateTime::createFromAnyFormat($dateFrom, $localZone);
		$endDate   = DateTime::createFromAnyFormat($dateTo, $localZone);

		//переводим таймзоны дат в UTC
		$startDate->setTimezone($utcZone);
		$endDate->setTimezone($utcZone);

		/** @var CalendarEvent[] $events */
		$events = CalendarEvent::find()
			->where([
				'and',
				CalendarEvent::ATTR_START_DATE . ' >= "' . $startDate->format(DateTime::DB_FORMAT) . '"',
				CalendarEvent::ATTR_END_DATE . ' <= "' . $endDate->format(DateTime::DB_FORMAT) . '"',
			])
			->all();

		if (!empty($events)) {
			foreach ($events as $eventItem) {
				$frontEvent = new static();
				$frontEvent->loadFromModel($eventItem);

				$result[] = $frontEvent;
			}
		}

		return $result;
	}

	/**
	 * Удаление события
	 *
	 * @param int $eventId
	 *
	 * @return bool
	 */
	public static function deleteEventById($eventId) {
		/** @var CalendarEvent $model */
		$model = CalendarEvent::findOne($eventId);

		if ($model === null) {
			return false;
		}

		return (bool) $model->delete();
	}

}