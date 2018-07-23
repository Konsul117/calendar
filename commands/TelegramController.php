<?php

namespace app\commands;

use app\components\TelegramService;
use yii\base\Module;
use yii\console\Controller;
use yii\helpers\Console;

/**
 * Работа с телеграм-функционалом.
 */
class TelegramController extends Controller {

	/** @var TelegramService Сервис для работы с Телеграмом */
	protected $service;

	/**
	 * @inheritdoc
	 *
	 * @param TelegramService $service Сервис для работы с Телеграмом
	 */
	public function __construct($id, Module $module, TelegramService $service, array $config = []) {
		$this->service = $service;
		parent::__construct($id, $module, $config);
	}

	/**
	 * Установка вебхуки.
	 *
	 * @throws \Telegram\Bot\Exceptions\TelegramSDKException
	 * @throws \yii\base\InvalidConfigException
	 */
	public function actionSetWebhook() {
		$this->stdout('Путь к файлу сертификата: ');
		$certPath = Console::stdin();
		$this->stdout(PHP_EOL);

		if (file_exists($certPath) === false) {
			$this->stderr('Файл сертификата не найден: ' . $certPath);
			return;
		}

		$this->stdout('Домен сайта (для URL вебхуки): ');
		$webhookUrl = Console::stdin();
		$this->stdout(PHP_EOL);

		$result = $this->service->getApi()->setWebhook([
			'certificate' => $certPath,
			'url'         => $webhookUrl,
		]);

		$this->stdout($result->__toString());

		$this->stdout(PHP_EOL);
	}

	/**
	 * Удаление вебхуки.
	 *
	 * @throws \Telegram\Bot\Exceptions\TelegramSDKException
	 * @throws \yii\base\InvalidConfigException
	 */
	public function actionDeleteWebhook() {
		$result = $this->service->getApi()->deleteWebhook();
		$this->stdout($result->__toString());
		$this->stdout(PHP_EOL);
	}

	/**
	 * Отправка сообщения.
	 *
	 * @throws \Telegram\Bot\Exceptions\TelegramSDKException
	 * @throws \yii\base\InvalidConfigException
	 */
	public function actionTestMessage() {
		$this->stdout('Chat id: ');
		$chatId = Console::stdin();
		$this->stdout(PHP_EOL);

		$this->stdout('Message: ');
		$message = Console::stdin();
		$this->stdout(PHP_EOL);

		$this->service->getApi()->sendMessage([
			'chat_id' => $chatId,
			'text' => $message,
		]);

		$this->stdout('Сообщение успешно отправлено');

	}
}