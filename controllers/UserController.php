<?php

namespace app\controllers;

use app\models\LoginForm;
use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;

class UserController extends Controller {

	public function behaviors() {
		return [
			'access' => [
				'class'	 => AccessControl::className(),
				'only'	 => ['logout'],
				'rules'	 => [
					[
						'actions'	 => ['logout'],
						'allow'		 => true,
						'roles'		 => ['@'],
					],
				],
			],
		];
	}

	public function actionIndex() {
		return $this->render('index');
	}

	public function actionLogin() {
		$this->view->title = 'Вход';
		if (!\Yii::$app->user->isGuest) {
			return $this->redirect(Yii::$app->user->getReturnUrl());
		}

		$model = new LoginForm();
		
		if ($model->load(Yii::$app->request->post()) && $model->login()) {
			return $this->redirect(Yii::$app->user->getReturnUrl());
		} else {
			return $this->render('login', [
						'model' => $model,
			]);
		}
	}

	public function actionLogout() {
		if (!\Yii::$app->user->isGuest) {
			Yii::$app->user->logout();
		}

		return $this->goHome();
	}

}
