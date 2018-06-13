--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.7
-- Dumped by pg_dump version 9.6.7

-- Started on 2018-05-25 15:41:20 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 7 (class 2615 OID 95771)
-- Name: gn_intero; Type: SCHEMA; Schema: -; Owner: geonatuser
--

CREATE SCHEMA gn_intero;


ALTER SCHEMA gn_intero OWNER TO geonatuser;

SET search_path = gn_intero, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 363 (class 1259 OID 95785)
-- Name: bib_formats; Type: TABLE; Schema: gn_intero; Owner: geonatuser
--

CREATE TABLE bib_formats (
    id_export_format integer NOT NULL,
    export_json boolean,
    export_rdf boolean,
    export_csv boolean
);


ALTER TABLE bib_formats OWNER TO geonatuser;

--
-- TOC entry 364 (class 1259 OID 95790)
-- Name: cor_exports_roles; Type: TABLE; Schema: gn_intero; Owner: geonatuser
--

CREATE TABLE cor_exports_roles (
    id_cor_exports_roles integer NOT NULL,
    roles character(255)
);


ALTER TABLE cor_exports_roles OWNER TO geonatuser;

-- Table: gn_intero.t_exports

DROP TABLE IF EXISTS gn_intero.t_exports;

CREATE TABLE gn_intero.t_exports
(
    selection text COLLATE pg_catalog."default",
    status numeric DEFAULT '-2'::integer,
    log text COLLATE pg_catalog."default",
    start date,
    "end" date,
    submission TIMESTAMP NOT NULL,
    CONSTRAINT t_exports_pkey PRIMARY KEY (submission)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE gn_intero.t_exports
    OWNER to geonatuser;
--
-- TOC entry 365 (class 1259 OID 95805)
-- Name: v_export; Type: VIEW; Schema: gn_intero; Owner: geonatuser
--

CREATE VIEW v_export WITH (security_barrier='false') AS
 SELECT export_occtax_sinp."nomCite",
    export_occtax_sinp."dateDebut",
    export_occtax_sinp."dateFin",
    export_occtax_sinp."heureDebut",
    export_occtax_sinp."heureFin",
    export_occtax_sinp."altMax",
    export_occtax_sinp."altMin",
    export_occtax_sinp."cdNom",
    export_occtax_sinp."cdRef",
    export_occtax_sinp.""
   FROM pr_occtax.export_occtax_sinp;


CREATE VIEW v_export_SINP WITH (security_barrier='false') AS
 SELECT export_occtax_sinp."permId",
    export_occtax_sinp."statObs",
    export_occtax_sinp."nomCite",
    export_occtax_sinp."dateDebut",
    export_occtax_sinp."dateFin",
    export_occtax_sinp."heureDebut",
    export_occtax_sinp."heureFin",
    export_occtax_sinp."altMax",
    export_occtax_sinp."altMin",
    export_occtax_sinp."cdNom",
    export_occtax_sinp."cdRef",
    export_occtax_sinp."versionTAXREF",
    export_occtax_sinp.datedet,
    export_occtax_sinp.comment,
    export_occtax_sinp."dSPublique",
    export_occtax_sinp."jddMetadonneeDEEId",
    export_occtax_sinp."statSource",
    export_occtax_sinp."diffusionNiveauPrecision",
    export_occtax_sinp."idOrigine",
    export_occtax_sinp."jddCode",
    export_occtax_sinp."jddId",
    export_occtax_sinp."refBiblio",
    export_occtax_sinp."obsMeth",
    export_occtax_sinp."ocEtatBio",
    export_occtax_sinp."ocNat",
    export_occtax_sinp."ocSex",
    export_occtax_sinp."ocStade",
    export_occtax_sinp."ocBiogeo",
    export_occtax_sinp."ocStatBio",
    export_occtax_sinp."preuveOui",
    export_occtax_sinp."ocMethDet",
    export_occtax_sinp."preuvNum",
    export_occtax_sinp."preuvNoNum",
    export_occtax_sinp."obsCtx",
    export_occtax_sinp."permIdGrp",
    export_occtax_sinp."methGrp",
    export_occtax_sinp."typGrp",
    export_occtax_sinp."denbrMax",
    export_occtax_sinp."denbrMin",
    export_occtax_sinp."objDenbr",
    export_occtax_sinp."typDenbr",
    export_occtax_sinp."obsId",
    export_occtax_sinp."obsNomOrg",
    export_occtax_sinp."detId",
    export_occtax_sinp."detNomOrg",
    export_occtax_sinp."orgGestDat",
    export_occtax_sinp."WKT",
    export_occtax_sinp."natObjGeo"
   FROM pr_contact.export_occtax_sinp;

CREATE VIEW v_export_SINP_json WITH (security_barrier='false') AS
    SELECT row_to_json(t.*) AS row_to_json
        FROM ( SELECT export_occtax_sinp."permId",
    export_occtax_sinp."statObs",
    export_occtax_sinp."nomCite",
    export_occtax_sinp."dateDebut",
    export_occtax_sinp."dateFin",
    export_occtax_sinp."heureDebut",
    export_occtax_sinp."heureFin",
    export_occtax_sinp."altMax",
    export_occtax_sinp."altMin",
    export_occtax_sinp."cdNom",
    export_occtax_sinp."cdRef",
    export_occtax_sinp."versionTAXREF",
    export_occtax_sinp.datedet,
    export_occtax_sinp.comment,
    export_occtax_sinp."dSPublique",
    export_occtax_sinp."jddMetadonneeDEEId",
    export_occtax_sinp."statSource",
    export_occtax_sinp."diffusionNiveauPrecision",
    export_occtax_sinp."idOrigine",
    export_occtax_sinp."jddCode",
    export_occtax_sinp."jddId",
    export_occtax_sinp."refBiblio",
    export_occtax_sinp."obsMeth",
    export_occtax_sinp."ocEtatBio",
    export_occtax_sinp."ocNat",
    export_occtax_sinp."ocSex",
    export_occtax_sinp."ocStade",
    export_occtax_sinp."ocBiogeo",
    export_occtax_sinp."ocStatBio",
    export_occtax_sinp."preuveOui",
    export_occtax_sinp."ocMethDet",
    export_occtax_sinp."preuvNum",
    export_occtax_sinp."preuvNoNum",
    export_occtax_sinp."obsCtx",
    export_occtax_sinp."permIdGrp",
    export_occtax_sinp."methGrp",
    export_occtax_sinp."typGrp",
    export_occtax_sinp."denbrMax",
    export_occtax_sinp."denbrMin",
    export_occtax_sinp."objDenbr",
    export_occtax_sinp."typDenbr",
    export_occtax_sinp."obsId",
    export_occtax_sinp."obsNomOrg",
    export_occtax_sinp."detId",
    export_occtax_sinp."detNomOrg",
    export_occtax_sinp."orgGestDat",
    export_occtax_sinp."WKT",
    export_occtax_sinp."natObjGeo"
   FROM pr_contact.export_occtax_sinp)t;
--
-- TOC entry 4066 (class 0 OID 95785)
-- Dependencies: 363
-- Data for Name: bib_formats; Type: TABLE DATA; Schema: gn_intero; Owner: geonatuser
--

COPY bib_formats (id_export_format, export_json, export_rdf, export_csv) FROM stdin;
\.


--
-- TOC entry 4067 (class 0 OID 95790)
-- Dependencies: 364
-- Data for Name: cor_exports_roles; Type: TABLE DATA; Schema: gn_intero; Owner: geonatuser
--

COPY cor_exports_roles (id_cor_exports_roles, roles) FROM stdin;
\.

--
-- TOC entry 3898 (class 2606 OID 95789)
-- Name: bib_formats bib_formats_pkey; Type: CONSTRAINT; Schema: gn_intero; Owner: geonatuser
--

ALTER TABLE ONLY bib_formats
    ADD CONSTRAINT bib_formats_pkey PRIMARY KEY (id_export_format);


--
-- TOC entry 3900 (class 2606 OID 95794)
-- Name: cor_exports_roles cor_exports_roles_pkey; Type: CONSTRAINT; Schema: gn_intero; Owner: geonatuser
--

ALTER TABLE ONLY cor_exports_roles
    ADD CONSTRAINT cor_exports_roles_pkey PRIMARY KEY (id_cor_exports_roles);
