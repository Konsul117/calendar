<?php

// comment out the following two lines when deployed to production
use yii\helpers\ArrayHelper;

defined('YII_DEBUG') or define('YII_DEBUG', true);
defined('YII_ENV') or define('YII_ENV', 'dev');

require(__DIR__ . '/../vendor/autoload.php');
require(__DIR__ . '/../vendor/yiisoft/yii2/Yii.php');

$config = require(__DIR__ . '/../config/web.php');

//подключаем url-правила
$urlRules = require(__DIR__ . '/../config/url-rules.php');

if (isset($config['components']['urlManager'])) {
	if (!isset($config['components']['urlManager']['rules'])) {
		$config['components']['urlManager']['rules'] = [];
	}
	$config['components']['urlManager']['rules'] = ArrayHelper::merge(
		$urlRules,
		$config['components']['urlManager']['rules']
	);
}

//проверяем наличие локального конфига
if (file_exists(__DIR__ . '/../config/local.php')) {
	//если есть, то читаем и сливаем с основным
	$config = ArrayHelper::merge($config, require(__DIR__ . '/../config/local.php'));
}

(new yii\web\Application($config))->run();
