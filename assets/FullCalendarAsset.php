<?php

namespace app\assets;

use yii\web\AssetBundle;
use yii\web\JqueryAsset;

/**
 * Asset-бандл для juqery-плагина FullCalendar
 */
class FullCalendarAsset extends AssetBundle {

	public $sourcePath = '@bower/fullcalendar';

	public $js = [
		'dist/fullcalendar.js',
		'dist/lang/ru.js',
	];

	public $css = [
		'dist/fullcalendar.min.css',
	];

	public $depends = [
		JqueryAsset::class,
		MomentAsset::class,
	];

}