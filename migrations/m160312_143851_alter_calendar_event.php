<?php

use yii\db\Migration;
use yii\db\Schema;

class m160312_143851_alter_calendar_event extends Migration {

	var $tableName = 'calendar_event';

	public function safeUp() {
		$this->addColumn($this->tableName, 'real_end_date', Schema::TYPE_DATETIME . ' COMMENT "Дата-время фактического окончания события" AFTER `end_date`');
	}

	public function safeDown() {
		$this->dropColumn($this->tableName, 'real_end_date');
	}
}
