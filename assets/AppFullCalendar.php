<?php

namespace app\assets;

use yii\bootstrap\BootstrapPluginAsset;
use yii\web\AssetBundle;

/**
 * Ассеты для использования календаря
 */
class AppFullCalendar extends AssetBundle {

	public $sourcePath = __DIR__;

	public $js = [
		'js/app-calendar.js',
	];

	public $css = [
		'css/app-calendar.css',
	];

	public $depends = [
		BootstrapPluginAsset::class,
		FullCalendarAsset::class,
		BootstrapDatetimePicker::class,
		JsCookieAsset::class,
	];

}