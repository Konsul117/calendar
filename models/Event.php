<?php

namespace app\models;


use yii\db\ActiveRecord;

/**
 * События календаря
 *
 * @property int    $id         Уникальный идентификатор события
 * @property string $start_date Уникальный идентификатор события
 * @property string $end_date   Дата-время окончания события
 * @property string $title      Название события
 */
class Event extends ActiveRecord {

	const ATTR_ID         = 'id';
	const ATTR_START_DATE = 'start_date';
	const ATTR_END_DATE   = 'end_date';
	const ATTR_TITLE      = 'title';

	/**
	 * @inheritdoc
	 */
	public function attributeLabels() {
		return [
			static::ATTR_START_DATE => 'Начало события',
			static::ATTR_END_DATE   => 'Конец события',
			static::ATTR_TITLE      => 'Название',
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
				static::ATTR_TITLE,
			],
		];
	}
	const SCENARIO_EDIT_EVENT = 'editEvent';
}