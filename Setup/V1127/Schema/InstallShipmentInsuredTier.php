<?php

namespace TIG\PostNL\Setup\V1127\Schema;

use TIG\PostNL\Setup\AbstractColumnsInstaller;

class InstallShipmentInsuredTier extends AbstractColumnsInstaller
{
    const TABLE_NAME = 'tig_postnl_shipment';

    // @codingStandardsIgnoreLine
    protected $columns = [
        'insured_tier'
    ];

    /**
     * @return array
     */
    public function installInsuredTierColumn()
    {
        return [
            // @codingStandardsIgnoreLine
            'type'     => \Magento\Framework\DB\Ddl\Table::TYPE_TEXT,
            'nullable' => true,
            'default'  => null,
            'comment'  => 'Extra Cover Insured Tier'
        ];
    }
}
