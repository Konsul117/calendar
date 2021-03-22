<?php

// comment out the following two lines when deployed to production
use yii\helpers\ArrayHelper;

$repository = dirname(__DIR__);
defined('YII_ENV') or define('YII_ENV', file_exists($repository . '/.dev') ? 'dev' : 'prod');
defined('YII_DEBUG') or define('YII_DEBUG', YII_ENV === 'dev');

require(__DIR__ . '/../vendor/autoload.php');
require(__DIR__ . '/../vendor/yiisoft/yii2/Yii.php');

$config = ArrayHelper::merge(
	require(__DIR__ . '/../config/common.php'),
	require(__DIR__ . '/../config/web.php')
);

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

$app = new yii\web\Application($config);
Yii::setAlias('@web', '@web' . $config['params']['webRoot']);
$app->run();
