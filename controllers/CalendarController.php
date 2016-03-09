<?php

namespace app\controllers;

use app\components\AjaxResponse;
use app\models\Event;
use Yii;
use yii\filters\AccessControl;
use yii\filters\VerbFilter;
use yii\web\Controller;
use yii\web\Response;

/**
 * Контроллер календаря
 */
class CalendarController extends Controller {

	/** @var AjaxResponse */
	protected $ajaxResponse;

	/**
	 * @inheritdoc
	 */
	public function init() {
		parent::init();
		$this->ajaxResponse = new AjaxResponse();
	}

	/**
	 * @inheritdoc
	 */
	public function behaviors() {
		return [
			'access' => [
				'class' => AccessControl::className(),
				'only'  => ['logout'],
				'rules' => [
					[
						'actions' => ['logout'],
						'allow'   => true,
						'roles'   => ['@'],
					],
				],
			],
			'verbs'  => [
				'class'   => VerbFilter::className(),
				'actions' => [
					'logout' => ['post'],
				],
			],
		];
	}

	/**
	 * @inheritdoc
	 */
	public function afterAction($action, $result) {
		if (Yii::$app->response->format == Response::FORMAT_JSON) {
			header('Content-Type: application/json');

			return $this->ajaxResponse;
		}

		return parent::afterAction($action, $result);
	}

	/**
	 * Основная страница календаря.
	 *
	 * @return string
	 */
	public function actionIndex() {
		return $this->render('index', [
			'eventModel' => (new Event()),
		]);
	}

	/**
	 *
	 */
	public function actionLoadEvents($from, $to) {
		Yii::$app->response->format = Response::FORMAT_JSON;

		$this->ajaxResponse->data = [];

		/** @var Event[] $events */
		$events = Event::find()
			->where([
				'and',
				Event::ATTR_START_DATE . ' >= "' . $from . '"',
				Event::ATTR_END_DATE . ' <= "' .$to . '"'
			])
			->all();

		if (!empty($events)) {
			foreach ($events as $event) {
				$this->ajaxResponse->data[] = [
					'dateStart' => $event->start_date,
					'title' => $event->title,
				];
			}
		}

		$this->ajaxResponse->success = true;
	}

	/**
	 *
	 */
	public function actionEditEvent() {
		Yii::$app->response->format = Response::FORMAT_JSON;

		$event = new Event();
		$event->setScenario(Event::SCENARIO_EDIT_EVENT);

		if (Yii::$app->request->isPost) {
			$event->load(Yii::$app->request->post());

			if ($event->validate()) {
				$this->ajaxResponse->success = $event->save();
			}
			else {
				$this->ajaxResponse->success = false;
				$errors = $event->getFirstErrors();

				if (!empty($errors)) {
					$this->ajaxResponse->message = array_shift($errors);
				}
			}
		}
	}

}