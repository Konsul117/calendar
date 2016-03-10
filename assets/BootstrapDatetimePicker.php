<?php

namespace app\assets;

use yii\bootstrap\BootstrapAsset;
use yii\web\AssetBundle;
use yii\web\JqueryAsset;

/**
 * Ассет-бандл для Bootstrap 3 Date/Time Picker
 *
 * @link https://github.com/Eonasdan/bootstrap-datetimepicker
 */
class BootstrapDatetimePicker extends AssetBundle {

	public $sourcePath = '@bower/eonasdan-bootstrap-datetimepicker';

	public $js = [
		'build/js/bootstrap-datetimepicker.min.js',
	];

	public $css = [
		'build/css/bootstrap-datetimepicker.min.css',
	];

	public $depends = [
		JqueryAsset::class,
		BootstrapAsset::class,
		MomentAsset::class,
	];
}