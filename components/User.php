<?php

namespace app\components;

use Yii;

class User extends \yii\web\User
{
    public function getReturnUrl($defaultUrl = null)
    {
        $result = parent::getReturnUrl($defaultUrl);

        return Yii::getAlias('@web') . ltrim($result, '/');
    }
}
