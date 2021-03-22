<?php

use yii\helpers\ArrayHelper;

$config = [
	'id'         => 'basic',
	'basePath'   => dirname(__DIR__),
	'bootstrap'  => ['log'],
	'components' => [
		'cache'        => [
			'class' => 'yii\caching\FileCache',
		],
		'mailer'       => [
			'class'            => 'yii\swiftmailer\Mailer',
			// send all mails to a file by default. You have to set
			// 'useFileTransport' to false and configure a transport
			// for the mailer to send real emails.
			'useFileTransport' => true,
		],
		'log'          => [
			'traceLevel' => YII_DEBUG ? 3 : 0,
			'targets'    => [
				[
					'class'  => 'yii\log\FileTarget',
					'levels' => ['error', 'warning'],
				],
				[
					'class'      => \app\components\FileLogTargetSimple::class,
					'categories' => ['telegram'],
					'levels'     => ['error', 'warning', 'info'],
					'logFile'    => '@runtime/logs/telegram.log',
				],
			],
		],
		'db'           => [
			'class'    => 'yii\db\Connection',
            'dsn'      => 'mysql:host=mysql;dbname=calendar',
            'username' => 'web',
            'password' => 'qwerty12345',
			'charset'  => 'utf8',
		],
	],
	'params' => [
        'webRoot'                => '',
		'defaultUTCOffset'       => 10,
		'proxies'                => [],
		'telegramApiKey'         => '',
		'telegramHookLogEnabled' => false,
	]
];

//проверяем наличие локального конфига
if (file_exists(__DIR__ . '/common-local.php')) {
	//если есть, то читаем и сливаем с основным
	$config = ArrayHelper::merge($config, require(__DIR__ . '/common-local.php'));
}

return $config;
