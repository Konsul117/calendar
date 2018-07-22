<?php

namespace app\components;

use GuzzleHttp\Client;
use Telegram\Bot\Api;
use Telegram\Bot\HttpClients\GuzzleHttpClient;
use Yii;
use yii\base\Component;
use yii\base\InvalidConfigException;

/**
 * Сервис для работы с Телеграмом.
 */
class TelegramService extends Component {

	/**
	 * Получение API.
	 *
	 * @throws InvalidConfigException
	 * @throws \Telegram\Bot\Exceptions\TelegramSDKException
	 */
	public function getApi() {
		$apiKey = Yii::$app->params['telegramApiKey'];

		if (trim($apiKey) === '') {
			throw new InvalidConfigException('Не указан ключ API Telegram');
		}

		$proxies = Yii::$app->params['proxies'];

		$client = null;

		if (count($proxies) > 0) {
			$proxyParams = reset($proxies);
			$client = new GuzzleHttpClient(new Client(['proxy' => 'socks5h://' . $proxyParams['address'] . ':' . $proxyParams['port']]));
		}

		return new Api(Yii::$app->params['telegramApiKey'], false, $client);
	}
}