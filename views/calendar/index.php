<?php

use app\components\CalendarEventFront;
use yii\web\View;
use yii\widgets\ActiveForm;

/** @var $this View * */
/** @var CalendarEventFront $eventModel */

$this->title = 'Календарь';
?>
<div class="site-index">

	<div class="body-content">

		<div class="calendar-block" data-role="calendar-widget">

			<div id="calendar" data-role="calendar-panel"></div>

			<div data-role="calendar-add-modal" class="calendar-modal add-modal">

				<?php $form = ActiveForm::begin(['options' => ['id' => 'contactForm', 'autocomplete' => 'off']]); ?>

				<?= $form->field($eventModel, CalendarEventFront::ATTR_ID, ['options' => ['class' => 'hidden']])
					->hiddenInput([
							'data-field' => CalendarEventFront::ATTR_ID,
					])->label(false) ?>

				<?= $form->field($eventModel, CalendarEventFront::ATTR_START_DATE, [
					'inputOptions' => [
							'data-field' => CalendarEventFront::ATTR_START_DATE,
							'class'     => 'form-control',
							'data-role' => 'datetimepicker',
					],
				]) ?>

				<?= $form->field($eventModel, CalendarEventFront::ATTR_END_DATE, [
						'inputOptions' => [
								'data-field' => CalendarEventFront::ATTR_END_DATE,
								'class'     => 'form-control',
								'data-role' => 'datetimepicker',
						],
				]) ?>

				<?= $form->field($eventModel, CalendarEventFront::ATTR_TITLE, [
					'inputOptions' => [
							'data-field' => CalendarEventFront::ATTR_TITLE,
							'class'     => 'form-control',
					]
				]) ?>

				<?= $form->field($eventModel, CalendarEventFront::ATTR_DESCRIPTION, [
						'inputOptions' => [
								'data-field' => CalendarEventFront::ATTR_DESCRIPTION,
								'class'     => 'form-control',
						]
				])->textarea() ?>

				<?= $form->field($eventModel, CalendarEventFront::ATTR_IS_COMPLETED)->checkbox([
						'data-field' => CalendarEventFront::ATTR_IS_COMPLETED,
				]) ?>

				<?php ActiveForm::end(); ?>


			</div>

			<div data-role="calendar-view-modal" class="calendar-modal view-modal">

				<div class="calendar-view-modal">
					<div class="event-row row" data-field="<?= CalendarEventFront::ATTR_START_DATE ?>">
						<span class="lbl col-xs-4"><?= $eventModel->getAttributeLabel(CalendarEventFront::ATTR_START_DATE) ?></span>
						<span class="value col-xs-8" data-role="event-row-value"></span>
					</div>

					<div class="event-row row" data-field="<?= CalendarEventFront::ATTR_END_DATE ?>">
						<span class="lbl col-xs-4"><?= $eventModel->getAttributeLabel(CalendarEventFront::ATTR_END_DATE) ?></span>
						<span class="value col-xs-8" data-role="event-row-value"></span>
					</div>

					<div class="event-row row" data-field="<?= CalendarEventFront::ATTR_DESCRIPTION ?>">
						<span class="lbl col-xs-4"><?= $eventModel->getAttributeLabel(CalendarEventFront::ATTR_DESCRIPTION) ?></span>
						<span class="value col-xs-8" data-role="event-row-value"></span>
					</div>

					<div class="event-row row" data-field="<?= CalendarEventFront::ATTR_IS_COMPLETED ?>">
						<span class="lbl col-xs-4"><?= $eventModel->getAttributeLabel(CalendarEventFront::ATTR_IS_COMPLETED) ?></span>
						<span class="value col-xs-8" data-role="event-row-value"></span>
					</div>
				</div>

			</div>
		</div>

	</div>
</div>
