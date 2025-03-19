<?php

if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();

class scody_jobwarning extends CModule
{
    var $VENDOR = 'scody';
    var $MODULE = 'jobwarning';
    var $MODULE_ID = 'scody.jobwarning';
    var $MODULE_VERSION;
    var $MODULE_VERSION_DATE;
    var $MODULE_NAME;
    var $MODULE_DESCRIPTION;
    var $MODULE_CSS;
    var $strError = '';

    function __construct()
    {
        $arModuleVersion = [];
        include(__DIR__ . '/version.php');

        $this->MODULE_VERSION      = $arModuleVersion["VERSION"];
        $this->MODULE_VERSION_DATE = $arModuleVersion["VERSION_DATE"];
        $this->MODULE_NAME         = GetMessage("SCODY_JOBWARNING_MODULE_NAME");
        $this->MODULE_DESCRIPTION  = GetMessage("SCODY_JOBWARNING_MODULE_DESCRIPTION");

        $this->PARTNER_NAME = GetMessage("SCODY_JOBWARNING_PARTNER_NAME");
        $this->PARTNER_URI  = GetMessage("SCODY_JOBWARNING_PARTNER_URI");
        
    }

    function InstallDB($arParams = [])
    {
        return true;
    }

    function UnInstallDB($arParams = [])
    {
        return true;
    }

    function InstallEvents()
    {
        $eventManager = \Bitrix\Main\EventManager::getInstance();
        $eventManager->registerEventHandler(
            'main',
            'OnEpilog',
            $this->MODULE_ID,
            '\Scody\CScodyJobwarning',
            'handleOnEpilog'
        );

        return true;
    }

    function UnInstallEvents()
    {

        $eventManager = \Bitrix\Main\EventManager::getInstance();
        $eventManager->unRegisterEventHandler(
            'main',
            'OnEpilog',
            $this->MODULE_ID,
            '\Scody\CScodyJobwarning',
            'handleOnEpilog'
        );
        return true;
    }

    function InstallFiles($arParams = [])
    {
        CopyDirFiles(
            dirname(__DIR__) . '/js',
            $_SERVER['DOCUMENT_ROOT'] . '/local/js/'.$this->VENDOR.'/'.$this->MODULE,
            true,
            true
        );

        return true;
    }

    function UnInstallFiles()
    {
        if (is_dir($p = $_SERVER['DOCUMENT_ROOT'] . '/local/js/'.$this->VENDOR.'/'.$this->MODULE))
        {
            if ($dir = opendir($p))
            {
                while (false !== $item = readdir($dir))
                {
                    if ($item == '..' || $item == '.')
                    {
                        continue;
                    }
                    unlink($_SERVER['DOCUMENT_ROOT'] . '/local/js/'.$this->VENDOR.'/'.$this->MODULE . '/' . $item);
                }
                closedir($dir);
            }
        }

        return true;
    }

    function DoInstall()
    {
        $this->InstallFiles();
        // $this->InstallDB();
        $this->InstallEvents();
        RegisterModule($this->MODULE_ID);
    }

    function DoUninstall()
    {
        UnRegisterModule($this->MODULE_ID);
        // $this->UnInstallDB();
        $this->UnInstallEvents();
        $this->UnInstallFiles();
    }
}

