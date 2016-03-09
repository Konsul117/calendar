<?php

namespace app\assets;


use yii\web\AssetBundle;

/**
 * Ассеты для использования календаря
 */
class AppFullCalendar extends AssetBundle {

	public $js = [
		'js/app-calendar.js',
	];

	public $css = [
		'css/app-calendar.css',
	];

	public $depends = [
		FullCalendarAsset::class,
	];

}