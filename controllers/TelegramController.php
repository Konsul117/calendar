<?php

namespace app\controllers;


use app\components\TelegramService;
use Yii;
use yii\base\Module;
use yii\web\Controller;

/**
 * Контроллер для вебхуки Телеграма.
 */
class TelegramController extends Controller {

	public $enableCsrfValidation = false;

	/** @var TelegramService Сервис для работы с Телеграмом */
	protected $service;

	/**
	 * @inheritdoc
	 * @param TelegramService $service Сервис для работы с Телеграмом
	 */
	public function __construct($id, Module $module, TelegramService $service, array $config = []) {
		$this->service = $service;
		parent::__construct($id, $module, $config);
	}

	/**
	 * Обработка вебхуки.
	 *
	 * @throws \Telegram\Bot\Exceptions\TelegramSDKException
	 * @throws \yii\base\InvalidConfigException
	 */
	public function actionIndex() {
		if (Yii::$app->params['telegramHookLogEnabled'] === true) {
			Yii::info(print_r(file_get_contents('php://input'), true), 'telegram');
		}

		$updates = $this->service->getApi()->getWebhookUpdate();

		if (Yii::$app->params['telegramHookLogEnabled'] === true) {
			Yii::info('chat id: ' . $updates->getChat()->id . ', message: ' . $updates->getMessage()->text, 'telegram');
		}
	}
}