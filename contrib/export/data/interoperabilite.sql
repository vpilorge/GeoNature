SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;


CREATE SCHEMA IF NOT EXISTS gn_interos;

SET search_path = gn_interos, pg_catalog;

CREATE TABLE t_exports(
    id_export integer NOT NULL,
    export_schema_name character varying(255),
    export_view_name character varying(255),

);

CREATE TABLE t_exports_logs(
    id_export_logs integer NOT NULL,
    export_logs_comment character varying(255),


);

CREATE TABLE bib_formats(
    id_export_format integer NOT NULL,
    export_json character varying(20),
    export_rdf character varying(20),
    export_csv character varying(20),
);

CREATE TABLE cor_exports_roles(
    id_cor_exports_roles integer NOT NULL,
    roles character varying(20),

);

COMMENT ON TABLE t_exports IS 'Cette table est utilisee pour declarer les exports.';
COMMENT ON TABLE t_exports_logs IS 'Cette table regroupe les logs.';
COMMENT ON TABLE bib_formats IS 'Bibliotheque de l ensemble des formats utiles.';
COMMENT ON TABLE cor_exports_roles IS 'Est la table de correspondance des divers roles possibles.';

--> PRIMARY KEY <--

ALTER TABLE ONLY t_exports
    ADD CONSTRAINT pk_t_exports PRIMARY KEY (id_export);

ALTER TABLE ONLY t_exports_logs
    ADD CONSTRAINT pk_t_exports_logs PRIMARY KEY (id_export_logs);

ALTER TABLE ONLY bib_formats
    ADD CONSTRAINT pk_bib_formats PRIMARY KEY (id_export_format);

ALTER TABLE ONLY cor_exports_roles
    ADD CONSTRAINT pk_cor_exports_roles PRIMARY KEY (id_cor_exports_roles);

--> FOREIGN KEY <--

-- ALTER TABLE ONLY t_exports
--     ADD CONSTRAINT fk_t_exports FOREIGN KEY () REFERENCES t_exports(id_export);

ALTER TABLE ONLY t_exports_logs
    ADD CONSTRAINT fk_t_exports_logs FOREIGN KEY (export_logs_comment) REFERENCES t_exports(id_export) ON UPDATE CASCADE;

--> VIEWS <--

CREATE OR REPLACE VIEW gn_interos.v_exports
AS SELECT occ.nom_cite AS "nomCite",
    rel.date_min AS "dateDebut",
    rel.date_max AS "dateFin",
    rel.hour_min AS "heureDebut",
    rel.hour_max AS "heureFin",
    rel.altitude_max AS "altMax",
    rel.altitude_min AS "altMin",
    occ.cd_nom AS "cdNom",
    taxonomie.find_cdref(occ.cd_nom) AS "cdRef",
FROM pr_contact.t_releves_contact rel
INNER JOIN 

