<?php

namespace app\components;

use yii\widgets\ActiveField;

/**
 * Расширение стандартного ActiveField для переопределения функций обёртки поля.
 */
class ActiveFieldCustom extends ActiveField {

	/** @var bool Не оборачивать поле в div */
	public $noWrap = false;

	/**
	 * @inheritdoc
	 */
	public function begin() {
		//если нужно оборачивать
		if (!$this->noWrap) {
			//то вызываем родительскую функцию
			return parent::begin();
		}

		return '';
	}

	/**
	 * @inheritdoc
	 */
	public function end() {
		//если нужно оборачивать
		if (!$this->noWrap) {
			//то вызываем родительскую функцию
			return parent::begin();
		}

		return '';
	}

}