<?php

namespace Scody;

use Bitrix\Main\Page\Asset;
use CComponentEngine;

class CScodyJobwarning
{
    public static function handleOnEpilog(): void
    {
        $request = \Bitrix\Main\Context::getCurrent()->getRequest();
        if ($request->isAdminSection())
        {
            return;
        }

        Asset::getInstance()->addJs('/local/js/scody/jobwarning/faviconoverlay.js');
    }
}


