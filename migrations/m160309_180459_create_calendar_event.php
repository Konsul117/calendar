<?php

use yii\db\Migration;
use yii\db\Schema;

class m160309_180459_create_calendar_event extends Migration {

	var $tableName = 'calendar_event';

	public function up() {
		$this->createTable($this->tableName, [
			'id'           => $this->primaryKey() . ' COMMENT "Уникальный идентификатор события"',
			'start_date'   => Schema::TYPE_DATETIME . ' COMMENT "Дата-время начала события"',
			'end_date'     => Schema::TYPE_DATETIME . ' COMMENT "Дата-время окончания события"',
			'title'        => Schema::TYPE_STRING . '(255) COMMENT "Название события"',
			'description'  => Schema::TYPE_TEXT . ' NOT NULL DEFAULT "" COMMENT "Описание события"',
			'is_completed' => 'tinyint NOT NULL DEFAULT 0 COMMENT "Завершение события"',
		], 'COMMENT "События календаря"');

		$this->createIndex('ix-' . $this->tableName . '-[start_date,end_date]', $this->tableName, ['start_date', 'end_date']);
	}

	public function down() {
		$this->dropTable($this->tableName);
	}
}
