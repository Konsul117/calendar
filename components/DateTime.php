<?php
/**
 * Created by PhpStorm.
 * User: konsul
 * Date: 10.03.16
 * Time: 21:49
 */

namespace app\components;

/**
 * Расширение класса DateTime
 */
class DateTime extends \DateTime {

	const DB_FORMAT    = 'Y-m-d H:i:s';
	const FRONT_FORMAT = 'Y.m.d H:i:s';
	const FRONT_OUT_FORMAT = 'd.m.Y H:i:s';
	const FRONT_OUT_SHORT_FORMAT = 'd.m.Y H:i';

	/**
	 * Получить объект DateTime по UTC.
	 *
	 * @param string $dateTimeString Дата-время в строковом виде по локальной таймзоне
	 * @param DateTimeZone $dateTimeZone Таймзона
	 *
	 * @return static
	 */
	public static function getUtcInstance($dateTimeString, $dateTimeZone = null) {
		if ($dateTimeZone === null) {
			$dateTimeZone = DateTimeZone::getDefault();
		}

		$dateTime = new static($dateTimeString, $dateTimeZone);

		return $dateTime->setTimezone(new DateTimeZone('UTC'));
	}

	public static function createFromAnyFormat ($time, DateTimeZone $timezone=null) {
		$formats = [
			static::FRONT_FORMAT,
			static::FRONT_OUT_FORMAT,
			static::FRONT_OUT_SHORT_FORMAT,
			static::DB_FORMAT,
		];

		do {

			$dateTime = parent::createFromFormat(array_shift($formats), $time, $timezone);

		} while (($dateTime === false) && !empty($formats));

		return $dateTime;
	}

}