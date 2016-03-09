<?php

use app\models\Event;
use yii\web\View;
use yii\widgets\ActiveForm;

/** @var $this View * */
/** @var Event $eventModel */

$this->title = 'My Yii Application';
?>
<div class="site-index">

	<div class="body-content">

		<div class="calendar-block" data-role="calendar-widget">

			<div id="calendar" data-role="calendar-panel"></div>

			<div data-role="calendar-add-modal" class="add-modal">

				<?php $form = ActiveForm::begin(['options' => ['id' => 'contactForm', 'autocomplete' => 'off']]); ?>

				<?= $form->field($eventModel, Event::ATTR_START_DATE) ?>
				<?= $form->field($eventModel, Event::ATTR_END_DATE) ?>
				<?= $form->field($eventModel, Event::ATTR_TITLE) ?>

				<?php ActiveForm::end(); ?>


			</div>
		</div>

	</div>
</div>
