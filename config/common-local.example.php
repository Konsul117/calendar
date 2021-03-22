<?php
return [
	'components' => [
//		'db'           => [
//			'dsn'      => 'mysql:host=localhost;dbname=',
//			'username' => '',
//			'password' => '',
//		],
	],
	'params'     => [
        'webRoot' => '',
		'proxies'                => [
			[
				'address' => 'address',
				'port'    => 'port',
			],
		],
		'telegramApiKey'         => 'token',
		'telegramHookLogEnabled' => false,
	],
];
