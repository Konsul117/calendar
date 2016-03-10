<?php

namespace app\controllers;

use app\components\AjaxResponse;
use app\components\CalendarEventFront;
use Yii;
use yii\filters\AccessControl;
use yii\filters\VerbFilter;
use yii\web\Controller;
use yii\web\Response;

/**
 * Контроллер календаря
 */
class CalendarController extends Controller {

	public $enableCsrfValidation = false;

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
			'eventModel' => (new CalendarEventFront()),
		]);
	}

	/**
	 *
	 */
	public function actionLoadEvents($from, $to) {
		Yii::$app->response->format = Response::FORMAT_JSON;

		$this->ajaxResponse->data = CalendarEventFront::loadEventsByInterval($from, $to);

		$this->ajaxResponse->success = true;
	}

	/**
	 *
	 */
	public function actionEditEvent() {
		Yii::$app->response->format = Response::FORMAT_JSON;

		$event = new CalendarEventFront();
		$event->setScenario(CalendarEventFront::SCENARIO_EDIT_EVENT);

		if (Yii::$app->request->isPost) {
			$event->load(Yii::$app->request->post(), '');

			if ($event->validate()) {
				$this->ajaxResponse->success    = $event->save();
				$this->ajaxResponse->data['id'] = $event->id;
			}
			else {
				$this->ajaxResponse->success = false;
				$errors                      = $event->getFirstErrors();

				if (!empty($errors)) {
					$this->ajaxResponse->message = array_shift($errors);
				}
			}
		}
	}

}