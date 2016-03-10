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
			],
		],
		'db'           => [
			'class'    => 'yii\db\Connection',
			'dsn'      => 'mysql:host=localhost;dbname=yii2basic',
			'username' => 'root',
			'password' => '',
			'charset'  => 'utf8',
		],
	],
	'params' => [
		'defaultUTCOffset' => 10,
	]
];

//проверяем наличие локального конфига
if (file_exists(__DIR__ . '/common-local.php')) {
	//если есть, то читаем и сливаем с основным
	$config = ArrayHelper::merge($config, require(__DIR__ . '/common-local.php'));
}

return $config;