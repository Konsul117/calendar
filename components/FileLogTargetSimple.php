<?php

namespace app\components;

use yii\log\FileTarget;

/**
 * Упрощённый тип логгирования в файл (без лишних переменных окружения)
 */
class FileLogTargetSimple extends FileTarget {

	public $logVars = [];

}