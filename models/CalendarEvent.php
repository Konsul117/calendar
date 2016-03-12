<?php

namespace app\models;


use yii\db\ActiveRecord;

/**
 * События календаря
 *
 * @property int    $id                Уникальный идентификатор события
 * @property string $start_date        Уникальный идентификатор события
 * @property string $end_date          Дата-время окончания события
 * @property string $real_end_date     Дата-время фактического окончания события
 * @property string $title             Название события
 * @property string $description       Описание события
 * @property bool   $is_completed      Завершение события
 */
class CalendarEvent extends ActiveRecord {

	const ATTR_ID            = 'id';
	const ATTR_START_DATE    = 'start_date';
	const ATTR_END_DATE      = 'end_date';
	const ATTR_REAL_END_DATE = 'real_end_date';
	const ATTR_TITLE         = 'title';


}