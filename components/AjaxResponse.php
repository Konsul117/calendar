<?php

namespace app\components;

class AjaxResponse {

	/**
	 * Данные
	 * @var array
	 */
	public $data;

	/**
	 * Успешность запроса
	 * @var boolean
	 */
	public $success = false;

	/**
	 * Ошибки
	 * @var string
	 */
	public $message;

	/**
	 * Html-контент
	 * @var string
	 */
	public $html;


}