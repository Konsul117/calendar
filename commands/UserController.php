<?php

namespace app\commands;

use app\models\User;
use yii\console\Controller;
use yii\helpers\Console;

/**
 * Первичная установка приложения
 */
class UserController extends Controller {

	/**
	 * Создание учётной записи администратора
	 */
	public function actionCreate() {
		$this->stdout('Добавление администратора' . PHP_EOL);

		$this->stdout('Логин: ' . PHP_EOL);

		$username = Console::stdin();

		$this->stdout('E-mail: ' . PHP_EOL);

		$email = Console::stdin();

		$this->stdout('Пароль: ' . PHP_EOL);

		$password = Console::stdin();

		$user           = new User();
		$user->username = $username;
		$user->email    = $email;
		$user->setPassword($password);
		$user->generateAuthKey();

		if ($user->validate() === false) {
			$this->stdout('Ошибки при вводе данных: ' . print_r($user->getErrors(), true));

			return ;
		}

		if ($user->save()) {
			$this->stdout('Пользователь добавлен' . PHP_EOL, Console::FG_GREEN);
		}
	}

}