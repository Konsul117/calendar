<?php

namespace app\assets;

use yii\web\AssetBundle;

/**
 * Ассет-бандл для js-плагина JavaScript Cookie
 *
 * @link https://github.com/js-cookie/js-cookie
 */
class JsCookieAsset extends AssetBundle {

	public $sourcePath = '@bower/js-cookie';

	public $js = [
		'src/js.cookie.js',
	];

}