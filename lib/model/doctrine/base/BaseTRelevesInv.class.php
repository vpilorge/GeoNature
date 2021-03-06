<?php

/**
 * BaseTRelevesInv
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 * 
 * @property integer $id_releve_inv
 * @property integer $id_inv
 * @property integer $id_nom
 * @property integer $id_critere_inv
 * @property integer $am
 * @property integer $af
 * @property integer $ai
 * @property integer $na
 * @property integer $cd_ref_origine
 * @property string $nom_taxon_saisi
 * @property string $commentaire
 * @property string $determinateur
 * @property boolean $supprime
 * @property boolean $prelevement
 * @property boolean $diffusable
 * @property BibCriteresInv $BibCriteresInv
 * @property BibNoms $BibNoms
 * @property TFichesInv $TFichesCf
 * @property Doctrine_Collection $VNomadeTaxonsInv
 * 
 * @method integer             get()                 Returns the current record's "id_releve_inv" value
 * @method integer             get()                 Returns the current record's "id_inv" value
 * @method integer             get()                 Returns the current record's "id_nom" value
 * @method integer             get()                 Returns the current record's "id_critere_inv" value
 * @method integer             get()                 Returns the current record's "am" value
 * @method integer             get()                 Returns the current record's "af" value
 * @method integer             get()                 Returns the current record's "ai" value
 * @method integer             get()                 Returns the current record's "na" value
 * @method integer             get()                 Returns the current record's "cd_ref_origine" value
 * @method string              get()                 Returns the current record's "nom_taxon_saisi" value
 * @method string              get()                 Returns the current record's "commentaire" value
 * @method string              get()                 Returns the current record's "determinateur" value
 * @method boolean             get()                 Returns the current record's "supprime" value
 * @method boolean             get()                 Returns the current record's "prelevement" value
 * @method boolean             get()                 Returns the current record's "diffusable" value
 * @method BibCriteresInv      get()                 Returns the current record's "BibCriteresInv" value
 * @method BibNoms             get()                 Returns the current record's "BibNoms" value
 * @method TFichesInv          get()                 Returns the current record's "TFichesCf" value
 * @method Doctrine_Collection get()                 Returns the current record's "VNomadeTaxonsInv" collection
 * @method TRelevesInv         set()                 Sets the current record's "id_releve_inv" value
 * @method TRelevesInv         set()                 Sets the current record's "id_inv" value
 * @method TRelevesInv         set()                 Sets the current record's "id_nom" value
 * @method TRelevesInv         set()                 Sets the current record's "id_critere_inv" value
 * @method TRelevesInv         set()                 Sets the current record's "am" value
 * @method TRelevesInv         set()                 Sets the current record's "af" value
 * @method TRelevesInv         set()                 Sets the current record's "ai" value
 * @method TRelevesInv         set()                 Sets the current record's "na" value
 * @method TRelevesInv         set()                 Sets the current record's "cd_ref_origine" value
 * @method TRelevesInv         set()                 Sets the current record's "nom_taxon_saisi" value
 * @method TRelevesInv         set()                 Sets the current record's "commentaire" value
 * @method TRelevesInv         set()                 Sets the current record's "determinateur" value
 * @method TRelevesInv         set()                 Sets the current record's "supprime" value
 * @method TRelevesInv         set()                 Sets the current record's "prelevement" value
 * @method TRelevesInv         set()                 Sets the current record's "diffusable" value
 * @method TRelevesInv         set()                 Sets the current record's "BibCriteresInv" value
 * @method TRelevesInv         set()                 Sets the current record's "BibNoms" value
 * @method TRelevesInv         set()                 Sets the current record's "TFichesCf" value
 * @method TRelevesInv         set()                 Sets the current record's "VNomadeTaxonsInv" collection
 * 
 * @package    geonature
 * @subpackage model
 * @author     Gil Deluermoz
 * @version    SVN: $Id: Builder.php 7490 2010-03-29 19:53:27Z jwage $
 */
abstract class BaseTRelevesInv extends sfDoctrineRecord
{
    public function setTableDefinition()
    {
        $this->setTableName('contactinv.t_releves_inv');
        $this->hasColumn('id_releve_inv', 'integer', 5, array(
             'type' => 'integer',
             'primary' => true,
             'length' => 5,
             ));
        $this->hasColumn('id_inv', 'integer', 5, array(
             'type' => 'integer',
             'length' => 5,
             ));
        $this->hasColumn('id_nom', 'integer', 4, array(
             'type' => 'integer',
             'length' => 4,
             ));
        $this->hasColumn('id_critere_inv', 'integer', 4, array(
             'type' => 'integer',
             'length' => 4,
             ));
        $this->hasColumn('am', 'integer', 4, array(
             'type' => 'integer',
             'length' => 4,
             ));
        $this->hasColumn('af', 'integer', 4, array(
             'type' => 'integer',
             'length' => 4,
             ));
        $this->hasColumn('ai', 'integer', 4, array(
             'type' => 'integer',
             'length' => 4,
             ));
        $this->hasColumn('na', 'integer', 4, array(
             'type' => 'integer',
             'length' => 4,
             ));
        $this->hasColumn('cd_ref_origine', 'integer', 4, array(
             'type' => 'integer',
             'length' => 4,
             ));
        $this->hasColumn('nom_taxon_saisi', 'string', 100, array(
             'type' => 'string',
             'length' => 100,
             ));
        $this->hasColumn('commentaire', 'string', null, array(
             'type' => 'string',
             'length' => '',
             ));
        $this->hasColumn('determinateur', 'string', 255, array(
             'type' => 'string',
             'length' => 255,
             ));
        $this->hasColumn('supprime', 'boolean', 1, array(
             'type' => 'boolean',
             'notnull' => true,
             'length' => 1,
             ));
        $this->hasColumn('prelevement', 'boolean', 1, array(
             'type' => 'boolean',
             'notnull' => true,
             'length' => 1,
             ));
        $this->hasColumn('diffusable', 'boolean', 1, array(
             'type' => 'boolean',
             'notnull' => false,
             'length' => 1,
             ));
    }

    public function setUp()
    {
        parent::setUp();
        $this->hasOne('BibCriteresInv', array(
             'local' => 'id_critere_inv',
             'foreign' => 'id_critere_inv'));

        $this->hasOne('BibNoms', array(
             'local' => 'id_nom',
             'foreign' => 'id_nom'));

        $this->hasOne('TFichesInv as TFichesCf', array(
             'local' => 'id_inv',
             'foreign' => 'id_inv'));

        $this->hasMany('VNomadeTaxonsInv', array(
             'local' => 'id_nom',
             'foreign' => 'id_nom'));
    }
}