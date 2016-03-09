<?php

namespace app\assets;


use yii\web\AssetBundle;

/**
 * Asset-бандл для библиотеки Moment.js
 */
class MomentAsset extends AssetBundle {

	public $sourcePath = '@bower/moment';

	public $js = [
		'min/moment.min.js',
		'min/locales.min.js',
	];

}