<?php
/**
 * Created by PhpStorm.
 * User: konsul
 * Date: 14.03.16
 * Time: 22:58
 */

namespace app\components;


use yii\widgets\ActiveField;

class ActiveFieldCustom extends ActiveField {

	public $noWrap = false;

	public function begin() {
		if (!$this->noWrap) {
			return parent::begin();
		}

		return '';
	}

	public function end() {
		if (!$this->noWrap) {
			return parent::begin();
		}

		return '';
	}

}