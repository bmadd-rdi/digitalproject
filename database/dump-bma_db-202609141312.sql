--
-- PostgreSQL database dump
--

-- Dumped from database version 15.18
-- Dumped by pg_dump version 17.0

-- Started on 2026-09-14 13:12:27

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE bma_db;
--
-- TOC entry 4006 (class 1262 OID 16384)
-- Name: bma_db; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE bma_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


\connect bma_db

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- TOC entry 4007 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 897 (class 1247 OID 16401)
-- Name: cost_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.cost_type AS ENUM (
    'IT',
    'NON_IT'
);


--
-- TOC entry 900 (class 1247 OID 16406)
-- Name: food_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.food_type AS ENUM (
    'PARTIAL_MEAL',
    'FULL_MEAL',
    'SNACK',
    'OTHER'
);


--
-- TOC entry 903 (class 1247 OID 16416)
-- Name: location_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.location_type AS ENUM (
    'GOVERNMENT',
    'PRIVATE'
);


--
-- TOC entry 1044 (class 1247 OID 17124)
-- Name: meeting_document_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.meeting_document_type AS ENUM (
    'MEETING_DOCUMENT',
    'MEETING_MINUTES'
);


--
-- TOC entry 1047 (class 1247 OID 17130)
-- Name: meeting_resolution_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.meeting_resolution_type AS ENUM (
    'APPROVED',
    'ACKNOWLEDGED',
    'CONDITIONAL_APPROVAL',
    'RECONSIDER',
    'NOT_APPROVED',
    'NOT_CONSIDERED'
);


--
-- TOC entry 906 (class 1247 OID 16422)
-- Name: personnel_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.personnel_type AS ENUM (
    'CORE',
    'ASST',
    'SUPP'
);


--
-- TOC entry 1041 (class 1247 OID 17118)
-- Name: project_return_stage; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_return_stage AS ENUM (
    'SMALL_BOARD',
    'BIG_BOARD'
);


--
-- TOC entry 909 (class 1247 OID 16430)
-- Name: project_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_type AS ENUM (
    'NEW',
    'REPLACEMENT',
    'CONTINUOUS'
);


--
-- TOC entry 912 (class 1247 OID 16438)
-- Name: proposal_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.proposal_status AS ENUM (
    'draft',
    'submitted',
    'passed_1',
    'rejected_1',
    'fix_1',
    'admin_assigned',
    'passed_2',
    'rejected_2',
    'fix_2',
    'meeting_scheduled',
    'meeting_passed',
    'fix_3',
    'fix_4',
    'meeting_rejected'
);


--
-- TOC entry 915 (class 1247 OID 16468)
-- Name: reference_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reference_type AS ENUM (
    'MDES',
    'MARKET',
    'PREVIOUS',
    'OTHER'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16478)
-- Name: agenda_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agenda_types (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(64)
);


--
-- TOC entry 217 (class 1259 OID 16477)
-- Name: agenda_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.agenda_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4008 (class 0 OID 0)
-- Dependencies: 217
-- Name: agenda_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.agenda_types_id_seq OWNED BY public.agenda_types.id;


--
-- TOC entry 266 (class 1259 OID 16798)
-- Name: agendas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agendas (
    id uuid NOT NULL,
    meeting_id uuid NOT NULL,
    project_id uuid,
    agenda_number character varying(50) NOT NULL,
    sort_order integer NOT NULL,
    agenda_type_id integer NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 16487)
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    department_name character varying(255) NOT NULL,
    department_code character varying(8) NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 16486)
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4009 (class 0 OID 0)
-- Dependencies: 219
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- TOC entry 222 (class 1259 OID 16496)
-- Name: deputy_governors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deputy_governors (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    activate boolean DEFAULT true NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 16495)
-- Name: deputy_governors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.deputy_governors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4010 (class 0 OID 0)
-- Dependencies: 221
-- Name: deputy_governors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.deputy_governors_id_seq OWNED BY public.deputy_governors.id;


--
-- TOC entry 224 (class 1259 OID 16503)
-- Name: divisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.divisions (
    division_id integer NOT NULL,
    department_id integer NOT NULL,
    division_name character varying(255) NOT NULL,
    division_code character varying(8) NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 16502)
-- Name: divisions_division_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.divisions_division_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4011 (class 0 OID 0)
-- Dependencies: 223
-- Name: divisions_division_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.divisions_division_id_seq OWNED BY public.divisions.division_id;


--
-- TOC entry 226 (class 1259 OID 16512)
-- Name: four_quadrants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.four_quadrants (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 16511)
-- Name: four_quadrants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.four_quadrants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4012 (class 0 OID 0)
-- Dependencies: 225
-- Name: four_quadrants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.four_quadrants_id_seq OWNED BY public.four_quadrants.id;


--
-- TOC entry 228 (class 1259 OID 16519)
-- Name: meeting_attachment_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_attachment_types (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(64)
);


--
-- TOC entry 227 (class 1259 OID 16518)
-- Name: meeting_attachment_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meeting_attachment_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4013 (class 0 OID 0)
-- Dependencies: 227
-- Name: meeting_attachment_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meeting_attachment_types_id_seq OWNED BY public.meeting_attachment_types.id;


--
-- TOC entry 267 (class 1259 OID 16807)
-- Name: meeting_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_attachments (
    id uuid NOT NULL,
    meeting_id uuid NOT NULL,
    agenda_id uuid,
    meeting_doc_type_id integer NOT NULL,
    uploaded_by uuid NOT NULL,
    file_name character varying(500) NOT NULL,
    file_url character varying(1000) NOT NULL,
    file_type character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    document_type public.meeting_document_type DEFAULT 'MEETING_DOCUMENT'::public.meeting_document_type NOT NULL,
    original_file_name character varying(500),
    stored_file_name character varying(500),
    storage_path character varying(1000),
    mime_type character varying(100),
    size_bytes bigint,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 271 (class 1259 OID 17143)
-- Name: meeting_resolution_revisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_resolution_revisions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    resolution_id uuid NOT NULL,
    project_id uuid NOT NULL,
    revision_number integer NOT NULL,
    previous_resolution_type character varying(64),
    new_resolution_type character varying(64) NOT NULL,
    previous_remark text,
    new_remark text,
    previous_project_status_id integer,
    new_project_status_id integer NOT NULL,
    previous_latest_approved_budget numeric(15,2),
    new_latest_approved_budget numeric(15,2),
    reason text,
    changed_by uuid NOT NULL,
    change_mode character varying(40) NOT NULL,
    changed_at timestamp without time zone DEFAULT now() NOT NULL,
    previous_final_approved_budget numeric(15,2),
    new_final_approved_budget numeric(15,2),
    previous_final_estimated_cost numeric(15,2),
    new_final_estimated_cost numeric(15,2)
);


--
-- TOC entry 230 (class 1259 OID 16528)
-- Name: meeting_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_statuses (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(64)
);


--
-- TOC entry 229 (class 1259 OID 16527)
-- Name: meeting_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meeting_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4014 (class 0 OID 0)
-- Dependencies: 229
-- Name: meeting_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meeting_statuses_id_seq OWNED BY public.meeting_statuses.id;


--
-- TOC entry 232 (class 1259 OID 16537)
-- Name: meeting_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_types (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(64)
);


--
-- TOC entry 231 (class 1259 OID 16536)
-- Name: meeting_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meeting_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4015 (class 0 OID 0)
-- Dependencies: 231
-- Name: meeting_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meeting_types_id_seq OWNED BY public.meeting_types.id;


--
-- TOC entry 268 (class 1259 OID 16815)
-- Name: meetings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meetings (
    id uuid NOT NULL,
    meeting_no character varying(100) NOT NULL,
    title character varying(500) NOT NULL,
    meeting_type_id integer NOT NULL,
    meeting_date timestamp without time zone NOT NULL,
    location character varying(500),
    meeting_status_id integer NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    description text,
    completed_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    cancel_reason text
);


--
-- TOC entry 234 (class 1259 OID 16546)
-- Name: project_attachment_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_attachment_types (
    doc_type_id integer NOT NULL,
    code character varying(64),
    doc_type_name character varying(255) NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 16545)
-- Name: project_attachment_types_doc_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_attachment_types_doc_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4016 (class 0 OID 0)
-- Dependencies: 233
-- Name: project_attachment_types_doc_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_attachment_types_doc_type_id_seq OWNED BY public.project_attachment_types.doc_type_id;


--
-- TOC entry 246 (class 1259 OID 16632)
-- Name: project_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_attachments (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    doc_type_id integer NOT NULL,
    uploaded_by uuid NOT NULL,
    file_name character varying(500) NOT NULL,
    file_url character varying(1000) NOT NULL,
    file_type character varying(100) NOT NULL,
    file_size bigint,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 247 (class 1259 OID 16640)
-- Name: project_sequences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_sequences (
    year integer NOT NULL,
    last_value integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 270 (class 1259 OID 16835)
-- Name: project_status_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_status_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    old_status_id integer NOT NULL,
    new_status_id integer NOT NULL,
    remark text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    source_operation character varying(100),
    meeting_id uuid,
    agenda_id uuid,
    resolution_id uuid
);


--
-- TOC entry 236 (class 1259 OID 16557)
-- Name: project_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_statuses (
    project_status_id integer NOT NULL,
    code character varying(64),
    project_status_name character varying(255) NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 16556)
-- Name: project_statuses_project_status_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_statuses_project_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4017 (class 0 OID 0)
-- Dependencies: 235
-- Name: project_statuses_project_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_statuses_project_status_id_seq OWNED BY public.project_statuses.project_status_id;


--
-- TOC entry 238 (class 1259 OID 16568)
-- Name: project_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_types (
    project_type_id integer NOT NULL,
    code character varying(64),
    project_type_name character varying(255) NOT NULL
);


--
-- TOC entry 237 (class 1259 OID 16567)
-- Name: project_types_project_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_types_project_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4018 (class 0 OID 0)
-- Dependencies: 237
-- Name: project_types_project_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_types_project_type_id_seq OWNED BY public.project_types.project_type_id;


--
-- TOC entry 248 (class 1259 OID 16646)
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    project_id uuid NOT NULL,
    project_code character varying(50),
    user_id uuid NOT NULL,
    division_id integer NOT NULL,
    project_status_id integer DEFAULT 1 NOT NULL,
    project_type_id integer,
    four_quadrants_id integer NOT NULL,
    deputy_governor_id integer NOT NULL,
    initial_requested_budget numeric(15,2),
    latest_requested_budget numeric(15,2),
    external_task_id character varying(255),
    project_name character varying(600),
    project_name_original character varying(600),
    analyst_id uuid,
    assigned_by uuid,
    assigned_at timestamp without time zone,
    is_public boolean DEFAULT false NOT NULL,
    public_token character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    deleted_at timestamp without time zone,
    return_stage public.project_return_stage,
    workflow_version integer DEFAULT 0 NOT NULL,
    final_approved_budget numeric(15,2),
    initial_estimated_cost numeric(15,2),
    latest_estimated_cost numeric(15,2),
    final_estimated_cost numeric(15,2)
);


--
-- TOC entry 4019 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN projects.project_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.projects.project_code IS 'รหัสโครงการ';


--
-- TOC entry 4020 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN projects.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.projects.user_id IS 'รหัสผู้ใช้';


--
-- TOC entry 4021 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN projects.division_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.projects.division_id IS 'รหัสส่วนราชการ';


--
-- TOC entry 4022 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN projects.project_status_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.projects.project_status_id IS 'รหัสสถานะ';


--
-- TOC entry 4023 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN projects.project_type_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.projects.project_type_id IS 'ประเภทโครงการ';


--
-- TOC entry 250 (class 1259 OID 16675)
-- Name: proposal_budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_budgets (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    year integer,
    amount numeric(15,2),
    budget_type character varying(255)
);


--
-- TOC entry 251 (class 1259 OID 16680)
-- Name: proposal_cloud_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_cloud_requests (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    system_name text NOT NULL,
    requested_service_date timestamp without time zone,
    recorded_request_date timestamp without time zone
);


--
-- TOC entry 252 (class 1259 OID 16687)
-- Name: proposal_cloud_vms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_cloud_vms (
    id uuid NOT NULL,
    cloud_request_id uuid NOT NULL,
    vm_description text NOT NULL,
    os_database character varying(255),
    vcpu integer DEFAULT 0,
    ram_gb integer DEFAULT 0,
    gpu_gb integer DEFAULT 0,
    storage_gb integer DEFAULT 0,
    price numeric(15,2) DEFAULT '0'::numeric
);


--
-- TOC entry 249 (class 1259 OID 16663)
-- Name: proposal_drafts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_drafts (
    draft_id uuid NOT NULL,
    project_id uuid,
    user_id uuid NOT NULL,
    project_name text,
    objective text,
    requested_budget_total numeric(15,2),
    current_step integer DEFAULT 1 NOT NULL,
    draft_payload jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    estimated_cost_total numeric(15,2)
);


--
-- TOC entry 253 (class 1259 OID 16699)
-- Name: proposal_existing_equipments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_existing_equipments (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    item_name character varying(255),
    age_years numeric(5,2),
    quantity integer,
    user_name character varying(255),
    location text,
    remark text
);


--
-- TOC entry 254 (class 1259 OID 16706)
-- Name: proposal_hardware_costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_hardware_costs (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    item_name text,
    quantity integer,
    unit_price numeric(15,2),
    reference_type public.reference_type,
    mdes_month character varying(50),
    mdes_year character varying(10),
    mdes_item_no character varying(100),
    market_count integer,
    market_company text,
    prev_project text,
    prev_year character varying(10),
    other_detail text
);


--
-- TOC entry 255 (class 1259 OID 16713)
-- Name: proposal_ict_personnel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_ict_personnel (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    "position" character varying(255),
    level character varying(255),
    count integer
);


--
-- TOC entry 256 (class 1259 OID 16720)
-- Name: proposal_manpower; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_manpower (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    agency_part character varying(255),
    position_limit integer,
    occupied integer,
    vacant integer
);


--
-- TOC entry 257 (class 1259 OID 16725)
-- Name: proposal_other_costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_other_costs (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    item_name text,
    quantity integer,
    unit_price numeric(15,2),
    remark text,
    cost_type public.cost_type
);


--
-- TOC entry 258 (class 1259 OID 16732)
-- Name: proposal_personnel_costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_personnel_costs (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    personnel_type public.personnel_type NOT NULL,
    "position" character varying(255),
    degree character varying(255),
    field_of_study character varying(255),
    experience_years numeric(4,1),
    base_salary numeric(15,2),
    multiplier numeric(5,2),
    person_count integer,
    duration_months integer
);


--
-- TOC entry 259 (class 1259 OID 16739)
-- Name: proposal_personnel_responsibilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_personnel_responsibilities (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    "position" character varying(255),
    responsibility text
);


--
-- TOC entry 260 (class 1259 OID 16746)
-- Name: proposal_related_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_related_projects (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    project_name text,
    agency character varying(255),
    fiscal_year character varying(10),
    relation_type character varying(255),
    remark text
);


--
-- TOC entry 261 (class 1259 OID 16753)
-- Name: proposal_software_costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_software_costs (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    item_name text,
    quantity integer,
    unit_price numeric(15,2),
    reference_type public.reference_type,
    mdes_month character varying(50),
    mdes_year character varying(10),
    mdes_item_no character varying(100),
    market_count integer,
    market_company text,
    prev_project text,
    prev_year character varying(10),
    other_detail text
);


--
-- TOC entry 262 (class 1259 OID 16760)
-- Name: proposal_training_food_costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_training_food_costs (
    id uuid NOT NULL,
    training_id uuid NOT NULL,
    item_name public.food_type NOT NULL,
    meals_count integer NOT NULL,
    rate_per_meal numeric(10,2) NOT NULL,
    trainees_count integer NOT NULL,
    days integer NOT NULL
);


--
-- TOC entry 263 (class 1259 OID 16765)
-- Name: proposal_training_speaker_costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_training_speaker_costs (
    id uuid NOT NULL,
    training_id uuid NOT NULL,
    item_name text NOT NULL,
    hours integer NOT NULL,
    rate_per_hour numeric(10,2) NOT NULL,
    days integer NOT NULL
);


--
-- TOC entry 264 (class 1259 OID 16772)
-- Name: proposal_trainings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_trainings (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    course_name text,
    training_method character varying(255),
    location_type public.location_type,
    has_speaker_cost boolean DEFAULT false,
    speaker_reason text
);


--
-- TOC entry 265 (class 1259 OID 16780)
-- Name: proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposals (
    id uuid NOT NULL,
    status public.proposal_status DEFAULT 'draft'::public.proposal_status NOT NULL,
    project_id uuid,
    user_id uuid NOT NULL,
    updated_by uuid,
    version integer DEFAULT 1,
    project_name text,
    agency_name character varying(255),
    head_of_agency character varying(255),
    dcio_name character varying(255),
    project_manager character varying(255),
    requested_budget_total numeric(15,2),
    background text,
    objective text,
    target text,
    scope text,
    project_type public.project_type,
    current_system_status text,
    current_problems text,
    is_bma_plan boolean DEFAULT false,
    is_agency_plan boolean DEFAULT false,
    agency_strategy text,
    agency_issue text,
    agency_kpi text,
    is_governor_policy boolean DEFAULT false,
    governor_policy_code character varying(100),
    governor_policy_name text,
    obstacle_laws text,
    app_architecture text,
    data_owner character varying(255),
    data_exchange_plan text,
    is_ready boolean DEFAULT false,
    readiness_details text,
    duration_days integer,
    other_readiness text,
    expected_benefits text,
    is_in_roadmap boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    estimated_cost_total numeric(15,2),
    submitted_at timestamp without time zone
);


--
-- TOC entry 240 (class 1259 OID 16579)
-- Name: resolution_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resolution_statuses (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(64)
);


--
-- TOC entry 239 (class 1259 OID 16578)
-- Name: resolution_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.resolution_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4024 (class 0 OID 0)
-- Dependencies: 239
-- Name: resolution_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.resolution_statuses_id_seq OWNED BY public.resolution_statuses.id;


--
-- TOC entry 269 (class 1259 OID 16824)
-- Name: resolutions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resolutions (
    id uuid NOT NULL,
    agenda_id uuid NOT NULL,
    resolution_status_id integer NOT NULL,
    comment text,
    recorded_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    resolution_type public.meeting_resolution_type,
    remark text,
    resolved_at timestamp without time zone,
    version integer DEFAULT 1 NOT NULL,
    governed_proposal_id uuid
);


--
-- TOC entry 241 (class 1259 OID 16587)
-- Name: role_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_user (
    user_id uuid NOT NULL,
    role_id integer NOT NULL,
    assigned_by uuid,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 243 (class 1259 OID 16594)
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    code character varying(64),
    role_name character varying(50) NOT NULL,
    description character varying(255)
);


--
-- TOC entry 242 (class 1259 OID 16593)
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4025 (class 0 OID 0)
-- Dependencies: 242
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- TOC entry 244 (class 1259 OID 16604)
-- Name: user_login_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_login_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    ip_address character varying(45),
    user_agent character varying(512),
    login_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 245 (class 1259 OID 16613)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id uuid NOT NULL,
    username character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    "position" character varying(150),
    level character varying(100),
    management_position character varying(150),
    division_id integer,
    mobile_phone character varying(20),
    office_phone character varying(20),
    internal_extension character varying(10),
    is_active boolean DEFAULT true NOT NULL,
    reset_password_token character varying(255),
    reset_password_expires timestamp without time zone,
    is_verified boolean DEFAULT false NOT NULL,
    verification_token character varying(255),
    verification_expires timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 272 (class 1259 OID 17152)
-- Name: workflow_audit_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_audit_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid NOT NULL,
    action character varying(100) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    reason text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 3512 (class 2604 OID 16481)
-- Name: agenda_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_types ALTER COLUMN id SET DEFAULT nextval('public.agenda_types_id_seq'::regclass);


--
-- TOC entry 3513 (class 2604 OID 16490)
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- TOC entry 3514 (class 2604 OID 16499)
-- Name: deputy_governors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deputy_governors ALTER COLUMN id SET DEFAULT nextval('public.deputy_governors_id_seq'::regclass);


--
-- TOC entry 3516 (class 2604 OID 16506)
-- Name: divisions division_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions ALTER COLUMN division_id SET DEFAULT nextval('public.divisions_division_id_seq'::regclass);


--
-- TOC entry 3517 (class 2604 OID 16515)
-- Name: four_quadrants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.four_quadrants ALTER COLUMN id SET DEFAULT nextval('public.four_quadrants_id_seq'::regclass);


--
-- TOC entry 3518 (class 2604 OID 16522)
-- Name: meeting_attachment_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_attachment_types ALTER COLUMN id SET DEFAULT nextval('public.meeting_attachment_types_id_seq'::regclass);


--
-- TOC entry 3519 (class 2604 OID 16531)
-- Name: meeting_statuses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_statuses ALTER COLUMN id SET DEFAULT nextval('public.meeting_statuses_id_seq'::regclass);


--
-- TOC entry 3520 (class 2604 OID 16540)
-- Name: meeting_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_types ALTER COLUMN id SET DEFAULT nextval('public.meeting_types_id_seq'::regclass);


--
-- TOC entry 3521 (class 2604 OID 16549)
-- Name: project_attachment_types doc_type_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_attachment_types ALTER COLUMN doc_type_id SET DEFAULT nextval('public.project_attachment_types_doc_type_id_seq'::regclass);


--
-- TOC entry 3522 (class 2604 OID 16560)
-- Name: project_statuses project_status_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_statuses ALTER COLUMN project_status_id SET DEFAULT nextval('public.project_statuses_project_status_id_seq'::regclass);


--
-- TOC entry 3523 (class 2604 OID 16571)
-- Name: project_types project_type_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_types ALTER COLUMN project_type_id SET DEFAULT nextval('public.project_types_project_type_id_seq'::regclass);


--
-- TOC entry 3524 (class 2604 OID 16582)
-- Name: resolution_statuses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolution_statuses ALTER COLUMN id SET DEFAULT nextval('public.resolution_statuses_id_seq'::regclass);


--
-- TOC entry 3526 (class 2604 OID 16597)
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- TOC entry 3946 (class 0 OID 16478)
-- Dependencies: 218
-- Data for Name: agenda_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.agenda_types VALUES (1, 'Chairman''s Announcements', 'FOR_INFORMATION');
INSERT INTO public.agenda_types VALUES (2, 'Adoption of Minutes', 'APPROVE_MINUTES');
INSERT INTO public.agenda_types VALUES (3, 'Matters Arising / Follow-up', 'FOLLOW_UP');
INSERT INTO public.agenda_types VALUES (4, 'Matters for Consideration', 'FOR_CONSIDERATION');
INSERT INTO public.agenda_types VALUES (5, 'Any Other Business', 'OTHER');


--
-- TOC entry 3994 (class 0 OID 16798)
-- Dependencies: 266
-- Data for Name: agendas; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 3948 (class 0 OID 16487)
-- Dependencies: 220
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.departments VALUES (1, 'สำนักงานเลขานุการสภากรุงเทพมหานคร', '01000000');
INSERT INTO public.departments VALUES (2, 'สำนักงานเลขานุการผู้ว่าราชการกรุงเทพมหานคร', '02000000');
INSERT INTO public.departments VALUES (3, 'สำนักงานคณะกรรมการข้าราชการกรุงเทพมหานคร', '03000000');
INSERT INTO public.departments VALUES (4, 'สำนักปลัดกรุงเทพมหานคร', '04000000');
INSERT INTO public.departments VALUES (5, 'สำนักการแพทย์', '07000000');
INSERT INTO public.departments VALUES (6, 'สำนักอนามัย', '08000000');
INSERT INTO public.departments VALUES (7, 'สำนักการศึกษา', '09000000');
INSERT INTO public.departments VALUES (8, 'สำนักการโยธา', '10000000');
INSERT INTO public.departments VALUES (9, 'สำนักการระบายน้ำ', '11000000');
INSERT INTO public.departments VALUES (10, 'สำนักการคลัง', '14000000');
INSERT INTO public.departments VALUES (11, 'สำนักเทศกิจ', '15000000');
INSERT INTO public.departments VALUES (12, 'สำนักการจราจรและขนส่ง', '17000000');
INSERT INTO public.departments VALUES (13, 'สำนักผังเมือง', '18000000');
INSERT INTO public.departments VALUES (14, 'สำนักป้องกันและบรรเทาสาธารณภัย', '19000000');
INSERT INTO public.departments VALUES (15, 'สำนักงบประมาณกรุงเทพมหานคร', '20000000');
INSERT INTO public.departments VALUES (16, 'สำนักยุทธศาสตร์และประเมินผล', '21000000');
INSERT INTO public.departments VALUES (17, 'สำนักสิ่งแวดล้อม', '22000000');
INSERT INTO public.departments VALUES (18, 'สำนักวัฒนธรรม กีฬาและการท่องเที่ยว', '23000000');
INSERT INTO public.departments VALUES (19, 'สำนักพัฒนาสังคม', '24000000');
INSERT INTO public.departments VALUES (20, 'สำนักการวางผังและพัฒนาเมือง', '25000000');
INSERT INTO public.departments VALUES (21, 'สำนักดิจิทัลกรุงเทพมหานคร', '26000000');
INSERT INTO public.departments VALUES (22, 'ศูนย์รับเรื่องร้องเรียน', '49000000');
INSERT INTO public.departments VALUES (23, 'การพาณิชย์ของกรุงเทพมหานคร', '51000000');
INSERT INTO public.departments VALUES (24, 'มหาวิทยาลัยกรุงเทพมหานคร', '99000000');
INSERT INTO public.departments VALUES (25, 'กรุงเทพมหานคร', '00000000');
INSERT INTO public.departments VALUES (26, 'สำนักนโยบายและแผนกรุงเทพมหานคร', '06000000');
INSERT INTO public.departments VALUES (27, 'สำนักรักษาความสะอาด', '12000000');
INSERT INTO public.departments VALUES (28, 'สำนักสวัสดิการสังคม', '13000000');
INSERT INTO public.departments VALUES (29, 'สำนักพัฒนาชุมชน', '16000000');
INSERT INTO public.departments VALUES (30, 'สำนักงานเขตพระนคร', '50010000');
INSERT INTO public.departments VALUES (31, 'สำนักงานเขตป้อมปราบศัตรูพ่าย', '50020000');
INSERT INTO public.departments VALUES (32, 'สำนักงานเขตสัมพันธวงศ์', '50030000');
INSERT INTO public.departments VALUES (33, 'สำนักงานเขตบางรัก', '50040000');
INSERT INTO public.departments VALUES (34, 'สำนักงานเขตปทุมวัน', '50050000');
INSERT INTO public.departments VALUES (35, 'สำนักงานเขตยานนาวา', '50060000');
INSERT INTO public.departments VALUES (36, 'สำนักงานเขตดุสิต', '50070000');
INSERT INTO public.departments VALUES (37, 'สำนักงานเขตพญาไท', '50080000');
INSERT INTO public.departments VALUES (38, 'สำนักงานเขตห้วยขวาง', '50090000');
INSERT INTO public.departments VALUES (39, 'สำนักงานเขตพระโขนง', '50100000');
INSERT INTO public.departments VALUES (40, 'สำนักงานเขตบางกะปิ', '50110000');
INSERT INTO public.departments VALUES (41, 'สำนักงานเขตบางเขน', '50120000');
INSERT INTO public.departments VALUES (42, 'สำนักงานเขตมีนบุรี', '50130000');
INSERT INTO public.departments VALUES (43, 'สำนักงานเขตลาดกระบัง', '50140000');
INSERT INTO public.departments VALUES (44, 'สำนักงานเขตหนองจอก', '50150000');
INSERT INTO public.departments VALUES (45, 'สำนักงานเขตธนบุรี', '50160000');
INSERT INTO public.departments VALUES (46, 'สำนักงานเขตคลองสาน', '50170000');
INSERT INTO public.departments VALUES (47, 'สำนักงานเขตบางกอกใหญ่', '50180000');
INSERT INTO public.departments VALUES (48, 'สำนักงานเขตบางกอกน้อย', '50190000');
INSERT INTO public.departments VALUES (49, 'สำนักงานเขตตลิ่งชัน', '50200000');
INSERT INTO public.departments VALUES (50, 'สำนักงานเขตภาษีเจริญ', '50210000');
INSERT INTO public.departments VALUES (51, 'สำนักงานเขตหนองแขม', '50220000');
INSERT INTO public.departments VALUES (52, 'สำนักงานเขตบางขุนเทียน', '50230000');
INSERT INTO public.departments VALUES (53, 'สำนักงานเขตราษฎร์บูรณะ', '50240000');
INSERT INTO public.departments VALUES (54, 'สำนักงานเขตดอนเมือง', '50250000');
INSERT INTO public.departments VALUES (55, 'สำนักงานเขตจตุจักร', '50260000');
INSERT INTO public.departments VALUES (56, 'สำนักงานเขตลาดพร้าว', '50270000');
INSERT INTO public.departments VALUES (57, 'สำนักงานเขตบึงกุ่ม', '50280000');
INSERT INTO public.departments VALUES (58, 'สำนักงานเขตสาทร', '50290000');
INSERT INTO public.departments VALUES (59, 'สำนักงานเขตบางคอแหลม', '50300000');
INSERT INTO public.departments VALUES (60, 'สำนักงานเขตบางซื่อ', '50310000');
INSERT INTO public.departments VALUES (61, 'สำนักงานเขตราชเทวี', '50320000');
INSERT INTO public.departments VALUES (62, 'สำนักงานเขตคลองเตย', '50330000');
INSERT INTO public.departments VALUES (63, 'สำนักงานเขตประเวศ', '50340000');
INSERT INTO public.departments VALUES (64, 'สำนักงานเขตบางพลัด', '50350000');
INSERT INTO public.departments VALUES (65, 'สำนักงานเขตจอมทอง', '50360000');
INSERT INTO public.departments VALUES (66, 'สำนักงานเขตดินแดง', '50370000');
INSERT INTO public.departments VALUES (67, 'สำนักงานเขตสวนหลวง', '50380000');
INSERT INTO public.departments VALUES (68, 'สำนักงานเขตวัฒนา', '50390000');
INSERT INTO public.departments VALUES (69, 'สำนักงานเขตบางแค', '50400000');
INSERT INTO public.departments VALUES (70, 'สำนักงานเขตหลักสี่', '50410000');
INSERT INTO public.departments VALUES (71, 'สำนักงานเขตสายไหม', '50420000');
INSERT INTO public.departments VALUES (72, 'สำนักงานเขตคันนายาว', '50430000');
INSERT INTO public.departments VALUES (73, 'สำนักงานเขตสะพานสูง', '50440000');
INSERT INTO public.departments VALUES (74, 'สำนักงานเขตวังทองหลาง', '50450000');
INSERT INTO public.departments VALUES (75, 'สำนักงานเขตคลองสามวา', '50460000');
INSERT INTO public.departments VALUES (76, 'สำนักงานเขตบางนา', '50470000');
INSERT INTO public.departments VALUES (77, 'สำนักงานเขตทวีวัฒนา', '50480000');
INSERT INTO public.departments VALUES (78, 'สำนักงานเขตทุ่งครุ', '50490000');
INSERT INTO public.departments VALUES (79, 'สำนักงานเขตบางบอน', '50500000');


--
-- TOC entry 3950 (class 0 OID 16496)
-- Dependencies: 222
-- Data for Name: deputy_governors; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.deputy_governors VALUES (2, 'รผว.วิศณุ', true);
INSERT INTO public.deputy_governors VALUES (3, 'รผว.ทวิดา', true);
INSERT INTO public.deputy_governors VALUES (4, 'รผว.ศานนท์', true);
INSERT INTO public.deputy_governors VALUES (5, 'รผว.พรพรหม', true);


--
-- TOC entry 3952 (class 0 OID 16503)
-- Dependencies: 224
-- Data for Name: divisions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.divisions VALUES (1, 25, 'กรุงเทพมหานคร', '00000000');
INSERT INTO public.divisions VALUES (2, 1, 'สำนักงานเลขานุการสภากรุงเทพมหานคร', '01000000');
INSERT INTO public.divisions VALUES (3, 1, 'ส่วนวิชาการ', '01010000');
INSERT INTO public.divisions VALUES (4, 2, 'สํานักงานเลขานุการผู้ว่าราชการกรุงเทพมหานคร', '02000000');
INSERT INTO public.divisions VALUES (5, 3, 'สำนักงานคณะกรรมการข้าราชการกรุงเทพมหานคร', '03000000');
INSERT INTO public.divisions VALUES (6, 3, 'กองบริหารทั่วไป', '03010000');
INSERT INTO public.divisions VALUES (7, 3, 'กองอัตรากำลัง', '03020000');
INSERT INTO public.divisions VALUES (8, 3, 'กองทะเบียนประวัติข้าราชการ', '03030000');
INSERT INTO public.divisions VALUES (9, 3, 'กองวินัยและเสริมสร้างจริยธรรม', '03040000');
INSERT INTO public.divisions VALUES (10, 3, 'กองสรรหาบุคคล', '03050000');
INSERT INTO public.divisions VALUES (11, 3, 'กองระบบงาน', '03060000');
INSERT INTO public.divisions VALUES (12, 3, 'กองพิทักษ์ระบบคุณธรรม', '03070000');
INSERT INTO public.divisions VALUES (13, 4, 'สํานักปลัดกรุงเทพมหานคร', '04000000');
INSERT INTO public.divisions VALUES (14, 4, 'สำนักงานเลขานุการปลัดกรุงเทพมหานคร', '04210000');
INSERT INTO public.divisions VALUES (15, 4, 'สำนักงานการเจ้าหน้าที่', '04190000');
INSERT INTO public.divisions VALUES (16, 4, 'สำนักงานปกครองและทะเบียน', '04170000');
INSERT INTO public.divisions VALUES (17, 4, 'สำนักงานตรวจสอบภายใน', '04180000');
INSERT INTO public.divisions VALUES (18, 4, 'กองงานผู้ตรวจราชการ', '04080000');
INSERT INTO public.divisions VALUES (19, 4, 'สถาบันพัฒนาข้าราชการ กทม.', '04090000');
INSERT INTO public.divisions VALUES (20, 4, 'สำนักงานประชาสัมพันธ์', '04200000');
INSERT INTO public.divisions VALUES (21, 4, 'สำนักงานกฎหมายและคดี', '04150000');
INSERT INTO public.divisions VALUES (22, 4, 'สำนักงานการต่างประเทศ', '04160000');
INSERT INTO public.divisions VALUES (23, 26, 'สำนักนโยบายและแผนกรุงเทพมหานคร', '06000000');
INSERT INTO public.divisions VALUES (24, 26, 'สำนักงานเลขานุการ', '06010000');
INSERT INTO public.divisions VALUES (25, 26, 'กองนโยบายและแผนรวม', '06020000');
INSERT INTO public.divisions VALUES (26, 26, 'กองแผนสาธารณูปโภคและ สวล.', '06030000');
INSERT INTO public.divisions VALUES (27, 26, 'กองแผนทรัพยากรมนุษย์และสังคม', '06040000');
INSERT INTO public.divisions VALUES (28, 26, 'กองแผนบริหารและการคลัง', '06050000');
INSERT INTO public.divisions VALUES (29, 26, 'กองการต่างประเทศ', '06080000');
INSERT INTO public.divisions VALUES (30, 26, 'กองพัฒนาระบบงานคอมพิวเตอร์', '06090000');
INSERT INTO public.divisions VALUES (31, 26, 'กองควบคุมระบบคอมพิวเตอร์', '06100000');
INSERT INTO public.divisions VALUES (32, 26, 'กองบริการระบบคอมพิวเตอร์', '06110000');
INSERT INTO public.divisions VALUES (33, 26, 'กองสารสนเทศภูมิศาสตร์', '06120000');
INSERT INTO public.divisions VALUES (34, 5, 'สำนักการแพทย์', '07000000');
INSERT INTO public.divisions VALUES (35, 5, 'สำนักงานเลขานุการ', '07010000');
INSERT INTO public.divisions VALUES (36, 5, 'สำนักงานพัฒนาระบบบริการทางการแพทย์  ', '07180000');
INSERT INTO public.divisions VALUES (37, 5, 'วิทยาลัยพยาบาลเกื้อการุณย์', '07030000');
INSERT INTO public.divisions VALUES (38, 5, 'โรงพยาบาลกลาง', '07050000');
INSERT INTO public.divisions VALUES (39, 5, 'โรงพยาบาลตากสิน', '07060000');
INSERT INTO public.divisions VALUES (40, 5, 'โรงพยาบาลเจริญกรุงประชารักษ์', '07070000');
INSERT INTO public.divisions VALUES (41, 5, 'โรงพยาบาลหลวงพ่อทวีศักดิ์ ชุตินฺธโรอุทิศ', '07080000');
INSERT INTO public.divisions VALUES (42, 5, 'โรงพยาบาลเวชการุณย์รัศมี์', '07160000');
INSERT INTO public.divisions VALUES (43, 5, 'โรงพยาบาลลาดกระบัง กทม.', '07100000');
INSERT INTO public.divisions VALUES (44, 5, 'โรงพยาบาลหนองจอก', '07090000');
INSERT INTO public.divisions VALUES (45, 5, 'โรงพยาบาลราชพิพัฒน์', '07130000');
INSERT INTO public.divisions VALUES (46, 5, 'โรงพยาบาลสิรินธร', '07140000');
INSERT INTO public.divisions VALUES (47, 5, 'ศูนย์บริการการแพทย์ฉุกเฉินกรุงเทพมหานคร (ศูนย์เอราวัณ)', '07150000');
INSERT INTO public.divisions VALUES (48, 5, 'โรงพยาบาลผู้สูงอายุบางขุนเทียน', '07170000');
INSERT INTO public.divisions VALUES (49, 5, 'โรงพยาบาลคลองสามวา', '07190000');
INSERT INTO public.divisions VALUES (50, 5, 'โรงพยาบาลบางนากรุงเทพมหานคร', '07200000');
INSERT INTO public.divisions VALUES (51, 6, 'สำนักอนามัย', '08000000');
INSERT INTO public.divisions VALUES (52, 6, 'สำนักงานเลขานุการ', '08010000');
INSERT INTO public.divisions VALUES (53, 6, 'กองสร้างเสริมสุขภาพ', '08030000');
INSERT INTO public.divisions VALUES (54, 6, 'กองการพยาบาลสาธารณสุข', '08040000');
INSERT INTO public.divisions VALUES (55, 6, 'กองทันตสาธารณสุข', '08050000');
INSERT INTO public.divisions VALUES (56, 6, 'สำนักงานสัตวแพทย์สาธารณสุข', '08750000');
INSERT INTO public.divisions VALUES (57, 6, 'กองควบคุมโรคติดต่อ', '08080000');
INSERT INTO public.divisions VALUES (58, 6, 'สำนักงานป้องกันและบำบัดการติดยาเสพติด', '08740000');
INSERT INTO public.divisions VALUES (59, 6, 'กองควบคุมโรคเอดส์ วัณโรค และโรคติดต่อทางเพศสัมพันธ์', '08730000');
INSERT INTO public.divisions VALUES (60, 6, 'กองเภสัชกรรม', '08110000');
INSERT INTO public.divisions VALUES (61, 6, 'ศูนย์บริการสาธารณสุข 1 สะพานมอญ', '08120000');
INSERT INTO public.divisions VALUES (62, 6, 'ศูนย์บริการสาธารณสุข 2 ราชปรารภ', '08130000');
INSERT INTO public.divisions VALUES (63, 6, 'ศูนย์บริการสาธารณสุข 3 บางซื่อ', '08140000');
INSERT INTO public.divisions VALUES (64, 6, 'ศูนย์บริการสาธารณสุข 4 ดินแดง', '08150000');
INSERT INTO public.divisions VALUES (65, 6, 'ศูนย์บริการสาธารณสุข 5 จุฬาลงกรณ์', '08160000');
INSERT INTO public.divisions VALUES (66, 6, 'ศูนย์บริการสาธารณสุข 6 สโมสรวัฒนธรรมหญิง', '08170000');
INSERT INTO public.divisions VALUES (193, 11, 'สำนักงานเลขานุการ', '15010000');
INSERT INTO public.divisions VALUES (67, 6, 'ศูนย์บริการสาธารณสุข 7 บุญมี ปุรุราชรังสรรค์', '08180000');
INSERT INTO public.divisions VALUES (68, 6, 'ศูนย์บริการสาธารณสุข 8 บุญรอด รุ่งเรือง', '08190000');
INSERT INTO public.divisions VALUES (69, 6, 'ศูนย์บริการสาธารณสุข 9 ประชาธิปไตย', '08200000');
INSERT INTO public.divisions VALUES (70, 6, 'ศูนย์บริการสาธารณสุข 10 สุขุมวิท', '08210000');
INSERT INTO public.divisions VALUES (71, 6, 'ศูนย์บริการสาธารณสุข 11 ประดิพัทธ์', '08220000');
INSERT INTO public.divisions VALUES (72, 6, 'ศูนย์บริการสาธารณสุข 12 จันทร์เที่ยง เนตรวิเศษ', '08230000');
INSERT INTO public.divisions VALUES (73, 6, 'ศูนย์บริการสาธารณสุข 13 ไมตรีวานิช', '08240000');
INSERT INTO public.divisions VALUES (74, 6, 'ศูนย์บริการสาธารณสุข 14 แก้วสีบุญเรือง', '08250000');
INSERT INTO public.divisions VALUES (75, 6, 'ศูนย์บริการสาธารณสุข 15 ลาดพร้าว', '08260000');
INSERT INTO public.divisions VALUES (76, 6, 'ศูนย์บริการสาธารณสุข 16 ลุมพินี', '08270000');
INSERT INTO public.divisions VALUES (77, 6, 'ศูนย์บริการสาธารณสุข 17 ประชานิเวศน์', '08280000');
INSERT INTO public.divisions VALUES (78, 6, 'ศูนย์บริการสาธารณสุข 18 มงคล-วอน วังตาล', '08290000');
INSERT INTO public.divisions VALUES (79, 6, 'ศูนย์บริการสาธารณสุข 19 วงศ์สว่าง', '08300000');
INSERT INTO public.divisions VALUES (80, 6, 'ศูนย์บริการสาธารณสุข 20 ธนาคารศรีนคร', '08310000');
INSERT INTO public.divisions VALUES (81, 6, 'ศูนย์บริการสาธารณสุข 21 วัดธาตุทอง', '08320000');
INSERT INTO public.divisions VALUES (82, 6, 'ศูนย์บริการสาธารณสุข 22 วัดปากบ่อ', '08330000');
INSERT INTO public.divisions VALUES (83, 6, 'ศูนย์บริการสาธารณสุข 23 สี่พระยา', '08340000');
INSERT INTO public.divisions VALUES (84, 6, 'ศูนย์บริการสาธารณสุข 24 บางเขน', '08350000');
INSERT INTO public.divisions VALUES (85, 6, 'ศูนย์บริการสาธารณสุข 25 ห้วยขวาง', '08360000');
INSERT INTO public.divisions VALUES (86, 6, 'ศูนย์บริการสาธารณสุข 26 เจ้าคุณประยูรวงศ์', '08370000');
INSERT INTO public.divisions VALUES (87, 6, 'ศูนย์บริการสาธารณสุข 27 จันทร์ฉิม ไพบูลย์', '08380000');
INSERT INTO public.divisions VALUES (88, 6, 'ศูนย์บริการสาธารณสุข 28 กรุงธนบุรี', '08390000');
INSERT INTO public.divisions VALUES (89, 6, 'ศูนย์บริการสาธารณสุข 29 ช่วง นุชเนตร', '08400000');
INSERT INTO public.divisions VALUES (90, 6, 'ศูนย์บริการสาธารณสุข 30 วัดเจ้าอาม', '08410000');
INSERT INTO public.divisions VALUES (91, 6, 'ศูนย์บริการสาธารณสุข 31 เอิบ - จิตร ทังสุบุตร', '08420000');
INSERT INTO public.divisions VALUES (92, 6, 'ศูนย์บริการสาธารณสุข 32 มาริษ ตินตมุสิก', '08430000');
INSERT INTO public.divisions VALUES (93, 6, 'ศูนย์บริการสาธารณสุข 33 วัดหงส์รัตนาราม', '08440000');
INSERT INTO public.divisions VALUES (94, 6, 'ศูนย์บริการสาธารณสุข 34 โพธิ์ศรี', '08450000');
INSERT INTO public.divisions VALUES (95, 6, 'ศูนย์บริการสาธารณสุข 35 หัวหมาก', '08460000');
INSERT INTO public.divisions VALUES (96, 6, 'ศูนย์บริการสาธารณสุข 36 บุคคโล', '08470000');
INSERT INTO public.divisions VALUES (97, 6, 'ศูนย์บริการสาธารณสุข 37 ประสงค์-สุดสาคร ตู้จินดา', '08480000');
INSERT INTO public.divisions VALUES (98, 6, 'ศูนย์บริการสาธารณสุข 38 จี๊ด ทองคำ บำเพ็ญ', '08490000');
INSERT INTO public.divisions VALUES (99, 6, 'ศูนย์บริการสาธารณสุข 39 ราษฎร์บูรณะ', '08500000');
INSERT INTO public.divisions VALUES (100, 6, 'ศูนย์บริการสาธารณสุข 40 บางแค', '08510000');
INSERT INTO public.divisions VALUES (101, 6, 'ศูนย์บริการสาธารณสุข 41 คลองเตย', '08520000');
INSERT INTO public.divisions VALUES (102, 6, 'ศูนย์บริการสาธารณสุข 42 ถนอม ทองสิมา', '08530000');
INSERT INTO public.divisions VALUES (103, 6, 'ศูนย์บริการสาธารณสุข 43 มีนบุรี', '08540000');
INSERT INTO public.divisions VALUES (104, 6, 'ศูนย์บริการสาธารณสุข 46 กันตารัติอุทิศ', '08550000');
INSERT INTO public.divisions VALUES (105, 6, 'ศูนย์บริการสาธารณสุข 47 คลองขวาง', '08560000');
INSERT INTO public.divisions VALUES (106, 6, 'ศูนย์บริการสาธารณสุข 48 นาควัชระอุทิศ', '08570000');
INSERT INTO public.divisions VALUES (107, 6, 'ศูนย์บริการสาธารณสุข 49 วัดชัยพฤกษมาลา', '08580000');
INSERT INTO public.divisions VALUES (108, 6, 'ศูนย์บริการสาธารณสุข 50 บึงกุ่ม', '08590000');
INSERT INTO public.divisions VALUES (109, 6, 'ศูนย์บริการสาธารณสุข 51 วัดไผ่ตัน', '08600000');
INSERT INTO public.divisions VALUES (110, 6, 'ศูนย์บริการสาธารณสุข 52 สามเสนนอก', '08610000');
INSERT INTO public.divisions VALUES (111, 6, 'ศูนย์บริการสาธารณสุข 53 ทุ่งสองห้อง', '08620000');
INSERT INTO public.divisions VALUES (112, 6, 'ศูนย์บริการสาธารณสุข 54 ทัศน์เอี่ยม', '08630000');
INSERT INTO public.divisions VALUES (113, 6, 'ศูนย์บริการสาธารณสุข 55 เตชะสัมพันธ์', '08640000');
INSERT INTO public.divisions VALUES (114, 6, 'ศูนย์บริการสาธารณสุข 56 ทับเจริญ', '08650000');
INSERT INTO public.divisions VALUES (115, 6, 'ศูนย์บริการสาธารณสุข 57 บุญเรือง ล้ำเลิศ', '08660000');
INSERT INTO public.divisions VALUES (116, 6, 'ศูนย์บริการสาธารณสุข 58 ล้อม-พิมเสน ฟักอุดม', '08670000');
INSERT INTO public.divisions VALUES (117, 6, 'ศูนย์บริการสาธารณสุข 59 ทุ่งครุ', '08680000');
INSERT INTO public.divisions VALUES (118, 6, 'ศูนย์บริการสาธารณสุข 60 รสสุคนธ์ มโนชญากร', '08690000');
INSERT INTO public.divisions VALUES (119, 6, 'ศูนย์บริการสาธารณสุข 61 สังวาลย์ ทัสนารมย์', '08700000');
INSERT INTO public.divisions VALUES (120, 6, 'ศูนย์บริการสาธารณสุข 62 ตวงรัชฏ์ ศศะนาวิน ภักดีฐานปัญญา', '08710000');
INSERT INTO public.divisions VALUES (265, 19, 'กองนโยบายและแผนงาน', '24020000');
INSERT INTO public.divisions VALUES (121, 6, 'ศูนย์บริการสาธารณสุข 63 สมาคมแต้จิ๋วแห่งประเทศไทย', '08880000');
INSERT INTO public.divisions VALUES (122, 6, 'สำนักงานชันสูตรสาธารณสุข', '08760000');
INSERT INTO public.divisions VALUES (123, 6, 'ศูนย์บริการสาธารณสุข 44 ลำผักชี หนองจอก', '08900000');
INSERT INTO public.divisions VALUES (124, 6, 'ศูนย์บริการสาธารณสุข 45 ร่มเกล้า ลาดกระบัง', '08910000');
INSERT INTO public.divisions VALUES (125, 6, 'ศูนย์บริการสาธารณสุข 65 รักษาสุข บางบอน', '08920000');
INSERT INTO public.divisions VALUES (126, 6, 'ศูนย์บริการสาธารณสุข 66 ตำหนักพระแม่กวนอิม โชคชัย4', '08930000');
INSERT INTO public.divisions VALUES (127, 6, 'สำนักงานพัฒนาระบบสาธารณสุข', '08720000');
INSERT INTO public.divisions VALUES (128, 6, 'สำนักงานสุขาภิบาลสิ่งแวดล้อม', '08950000');
INSERT INTO public.divisions VALUES (129, 6, 'กองสุขาภิบาลอาหาร', '08960000');
INSERT INTO public.divisions VALUES (130, 6, 'ศูนย์บริการสาธารณสุข 64 คลองสามวา', '08970000');
INSERT INTO public.divisions VALUES (131, 6, 'ศูนย์บริการสาธารณสุข 67 ทวีวัฒนา', '08980000');
INSERT INTO public.divisions VALUES (132, 6, 'ศูนย์บริการสาธารณสุข 68 สะพานสูง', '08990000');
INSERT INTO public.divisions VALUES (133, 7, 'สำนักการศึกษา', '09000000');
INSERT INTO public.divisions VALUES (134, 7, 'สำนักงานเลขานุการ', '09010000');
INSERT INTO public.divisions VALUES (135, 7, 'สำนักงานการเจ้าหน้าที่', '09020000');
INSERT INTO public.divisions VALUES (136, 7, 'กองคลัง', '09030000');
INSERT INTO public.divisions VALUES (137, 7, 'หน่วยงานศึกษานิเทศก์', '09040000');
INSERT INTO public.divisions VALUES (138, 7, 'กองวิชาการ', '09060000');
INSERT INTO public.divisions VALUES (139, 7, 'โรงเรียนมัธยมบ้านบางกะปิ', '09070000');
INSERT INTO public.divisions VALUES (140, 7, 'โรงเรียนมัธยมประชานิเวศน์', '09080000');
INSERT INTO public.divisions VALUES (141, 7, 'โรงเรียนมัธยมนาคนาวาอุปถัมภ์', '09090000');
INSERT INTO public.divisions VALUES (142, 7, 'โรงเรียนมัธยมสุวิทย์เสรีอนุสรณ์', '09100000');
INSERT INTO public.divisions VALUES (143, 7, 'สำนักงานยุทธศาสตร์การศึกษา', '09110000');
INSERT INTO public.divisions VALUES (144, 7, 'กองเทคโนโลยีเพื่อการเรียนการสอน', '09120000');
INSERT INTO public.divisions VALUES (145, 7, 'กองพัฒนาข้าราชการครูากรุงเทพมหานคร', '09130000');
INSERT INTO public.divisions VALUES (146, 7, 'สำนักงานการเจ้าหน้าที่', '09140000');
INSERT INTO public.divisions VALUES (147, 8, 'สำนักการโยธา', '10000000');
INSERT INTO public.divisions VALUES (148, 8, 'สำนักงานเลขานุการ', '10010000');
INSERT INTO public.divisions VALUES (149, 8, 'กองวิเคราะห์และวิจัย', '10030000');
INSERT INTO public.divisions VALUES (150, 8, 'กองควบคุมการก่อสร้าง', '10060000');
INSERT INTO public.divisions VALUES (151, 8, 'กองควบคุมอาคาร', '10070000');
INSERT INTO public.divisions VALUES (152, 8, 'กองแผนงานและประสานสาธารณูปโภค', '10090000');
INSERT INTO public.divisions VALUES (153, 8, 'สำนักงานก่อสร้างและบูรณะ', '10100000');
INSERT INTO public.divisions VALUES (154, 8, 'สำนักงานออกแบบ', '10110000');
INSERT INTO public.divisions VALUES (155, 8, 'กองสำรวจและแผนที่ที่ดิน', '10120000');
INSERT INTO public.divisions VALUES (156, 8, 'สำนักงานจัดกรรมสิทธิ์', '10130000');
INSERT INTO public.divisions VALUES (157, 8, 'สำนักงานวิศวกรรมทาง', '10160000');
INSERT INTO public.divisions VALUES (158, 9, 'สำนักการระบายน้ำ', '11000000');
INSERT INTO public.divisions VALUES (159, 9, 'สำนักงานเลขานุการ', '11010000');
INSERT INTO public.divisions VALUES (160, 9, 'กองเครื่องจักรกล', '11060000');
INSERT INTO public.divisions VALUES (161, 9, 'กองสารสนเทศระบายน้ำ', '11080000');
INSERT INTO public.divisions VALUES (162, 9, 'สำนักงานระบบควบคุมน้ำ', '11160000');
INSERT INTO public.divisions VALUES (163, 9, 'กองระบบท่อระบายน้ำ', '11100000');
INSERT INTO public.divisions VALUES (164, 9, 'กองระบบคลอง', '11110000');
INSERT INTO public.divisions VALUES (165, 9, 'กองจัดการคุณภาพน้ำ', '11120000');
INSERT INTO public.divisions VALUES (166, 9, 'สำนักงานจัดการคุณภาพน้ำ', '11130000');
INSERT INTO public.divisions VALUES (167, 9, 'สำนักงานพัฒนาระบบระบายน้ำ', '11140000');
INSERT INTO public.divisions VALUES (168, 27, 'สำนักรักษาความสะอาด', '12000000');
INSERT INTO public.divisions VALUES (169, 27, 'สำนักงานเลขานุการ', '12010000');
INSERT INTO public.divisions VALUES (170, 27, 'กองบริการรักษาความสะอาด', '12020000');
INSERT INTO public.divisions VALUES (171, 27, 'กองควบคุมสิ่งปฏิกูล', '12030000');
INSERT INTO public.divisions VALUES (172, 27, 'กองโรงงานกำจัดมูลฝอย', '12040000');
INSERT INTO public.divisions VALUES (173, 27, 'กองวิชาการและแผนงาน', '12050000');
INSERT INTO public.divisions VALUES (174, 28, 'สำนักสวัสดิการสังคม', '13000000');
INSERT INTO public.divisions VALUES (175, 28, 'สำนักงานเลขานุการ', '13010000');
INSERT INTO public.divisions VALUES (176, 28, 'กองสังคมสงเคราะห์', '13020000');
INSERT INTO public.divisions VALUES (177, 28, 'กองนันทนาการ', '13040000');
INSERT INTO public.divisions VALUES (178, 28, 'กองการกีฬา', '13050000');
INSERT INTO public.divisions VALUES (179, 28, 'สำนักงานสวนสาธารณะ', '13060000');
INSERT INTO public.divisions VALUES (180, 28, 'กองสวัสดิภาพเด็ก สตรี ผู้สูงอายุ ผู้พิการ และผู้ด้อยโอกาส', '13070000');
INSERT INTO public.divisions VALUES (181, 10, 'สํานักการคลัง', '14000000');
INSERT INTO public.divisions VALUES (182, 10, 'สำนักงานเลขานุการ', '14010000');
INSERT INTO public.divisions VALUES (183, 10, 'กองรายได้', '14020000');
INSERT INTO public.divisions VALUES (184, 10, 'กองการเงิน', '14030000');
INSERT INTO public.divisions VALUES (185, 10, 'กองทะเบียนทรัพย์สินและพัสดุ', '14040000');
INSERT INTO public.divisions VALUES (186, 10, 'กองบัญชี', '14050000');
INSERT INTO public.divisions VALUES (187, 10, 'กองระบบการคลัง', '14060000');
INSERT INTO public.divisions VALUES (188, 10, 'กองโรงงานช่างกล', '14070000');
INSERT INTO public.divisions VALUES (189, 10, 'กองตรวจจ่าย', '14080000');
INSERT INTO public.divisions VALUES (190, 10, 'สำนักงานเศรษฐกิจการคลัง', '14090000');
INSERT INTO public.divisions VALUES (191, 10, 'กองบำเหน็จบำนาญ', '14100000');
INSERT INTO public.divisions VALUES (192, 11, 'สํานักเทศกิจ', '15000000');
INSERT INTO public.divisions VALUES (194, 11, 'กองวิชาการและแผนงาน', '15020000');
INSERT INTO public.divisions VALUES (195, 11, 'กองตรวจการเทศกิจ', '15030000');
INSERT INTO public.divisions VALUES (196, 11, 'กองนโยบายและแผนงาน', '15050000');
INSERT INTO public.divisions VALUES (197, 11, 'กองตรวจและปฏิบัติการพื้นที่ 1', '15060000');
INSERT INTO public.divisions VALUES (198, 11, 'กองนิติการและบังคับคดี', '15110000');
INSERT INTO public.divisions VALUES (199, 29, 'สำนักพัฒนาชุมชน', '16000000');
INSERT INTO public.divisions VALUES (200, 29, 'สำนักงานเลขานุการ', '16010000');
INSERT INTO public.divisions VALUES (201, 29, 'กองส่งเสริมอาชีพ', '16030000');
INSERT INTO public.divisions VALUES (202, 29, 'กองวิชาการและแผนงาน', '16130000');
INSERT INTO public.divisions VALUES (203, 29, 'กองการพัฒนาชุมชน', '16140000');
INSERT INTO public.divisions VALUES (204, 12, 'สํานักการจราจรและขนส่ง', '17000000');
INSERT INTO public.divisions VALUES (205, 12, 'สำนักงานเลขานุการ', '17010000');
INSERT INTO public.divisions VALUES (206, 12, 'สำนักงานระบบขนส่ง', '17040000');
INSERT INTO public.divisions VALUES (207, 12, 'กองนโยบายและแผนงาน', '17120000');
INSERT INTO public.divisions VALUES (208, 12, 'สำนักงานวิศวกรรมจราจร', '17130000');
INSERT INTO public.divisions VALUES (209, 12, 'กองพัฒนาระบบจราจร', '17140000');
INSERT INTO public.divisions VALUES (210, 13, 'สำนักการวางผังและพัฒนาเมือง', '18000000');
INSERT INTO public.divisions VALUES (211, 13, 'สำนักงานเลขานุการ', '18010000');
INSERT INTO public.divisions VALUES (212, 13, 'กองสำรวจและแผนที่', '18030000');
INSERT INTO public.divisions VALUES (213, 13, 'กองวางผังพัฒนาเมือง', '18050000');
INSERT INTO public.divisions VALUES (214, 13, 'กองจัดรูปที่ดินและปรับปรุงฟื้นฟูเมือง', '18060000');
INSERT INTO public.divisions VALUES (215, 13, 'กองควบคุมทางผังเมือง', '18070000');
INSERT INTO public.divisions VALUES (216, 13, 'กองนโยบายและแผนงาน', '18080000');
INSERT INTO public.divisions VALUES (217, 14, 'สำนักป้องกันและบรรเทาสาธารณภัย', '19000000');
INSERT INTO public.divisions VALUES (218, 14, 'สำนักงานเลขานุการ', '19010000');
INSERT INTO public.divisions VALUES (219, 14, 'กองวิชาการและแผนงาน', '19020000');
INSERT INTO public.divisions VALUES (220, 14, 'กองอำนวยการป้องกันและบรรเทาสาธารณภัย', '19030000');
INSERT INTO public.divisions VALUES (221, 14, 'กองปฏิบัติการดับเพลิง 1', '19040000');
INSERT INTO public.divisions VALUES (222, 14, 'กองปฏิบัติการดับเพลิง 2', '19050000');
INSERT INTO public.divisions VALUES (223, 14, 'กองปฏิบัติการดับเพลิง 3', '19060000');
INSERT INTO public.divisions VALUES (224, 14, 'กองปฏิบัติการดับเพลิง 4', '19070000');
INSERT INTO public.divisions VALUES (225, 14, 'กองปฏิบัติการดับเพลิง 5', '19080000');
INSERT INTO public.divisions VALUES (226, 14, 'กองปฏิบัติการดับเพลิง 6', '19090000');
INSERT INTO public.divisions VALUES (227, 15, 'สำนักงบประมาณกรุงเทพมหานคร', '20000000');
INSERT INTO public.divisions VALUES (228, 15, 'สำนักงานเลขานุการ', '20010000');
INSERT INTO public.divisions VALUES (229, 15, 'สำนักงานระบบงบประมาณ', '20070000');
INSERT INTO public.divisions VALUES (230, 15, 'กองวิเคราะห์งบประมาณ 1', '20030000');
INSERT INTO public.divisions VALUES (231, 15, 'กองวิเคราะห์งบประมาณ 2', '20040000');
INSERT INTO public.divisions VALUES (232, 15, 'กองวิเคราะห์งบประมาณ 3', '20050000');
INSERT INTO public.divisions VALUES (233, 15, 'กองวิเคราะห์งบประมาณ 4', '20060000');
INSERT INTO public.divisions VALUES (234, 15, 'กองวิเคราะห์งบประมาณ 5', '20080000');
INSERT INTO public.divisions VALUES (235, 15, 'กองวิเคราะห์งบประมาณ 6', '20090000');
INSERT INTO public.divisions VALUES (236, 16, 'สำนักยุทธศาสตร์และประเมินผล', '21000000');
INSERT INTO public.divisions VALUES (237, 16, 'สำนักงานเลขานุการ', '21010000');
INSERT INTO public.divisions VALUES (238, 16, 'กองยุทธศาสตร์บริหารจัดการ', '21020000');
INSERT INTO public.divisions VALUES (239, 16, 'กองยุทธศาสตร์เศรษฐกิจ การเงิน และการคลัง', '21030000');
INSERT INTO public.divisions VALUES (240, 16, 'กองยุทธศาสตร์สาธารณสุขและสิ่งแวดล้อม', '21040000');
INSERT INTO public.divisions VALUES (241, 16, 'กองยุทธศาสตร์สาธารณูปโภคพื้นฐาน', '21050000');
INSERT INTO public.divisions VALUES (242, 16, 'กองยุทธศาสตร์ทรัพยากรมนุษย์และสังคม', '21060000');
INSERT INTO public.divisions VALUES (243, 16, 'กองพัฒนาระบบงานคอมพิวเตอร์', '21070000');
INSERT INTO public.divisions VALUES (244, 16, 'กองควบคุมระบบคอมพิวเตอร์', '21080000');
INSERT INTO public.divisions VALUES (245, 16, 'กองบริการระบบคอมพิวเตอร์', '21090000');
INSERT INTO public.divisions VALUES (246, 16, 'กองสารสนเทศภูมิศาสตร์', '21100000');
INSERT INTO public.divisions VALUES (247, 17, 'สำนักสิ่งแวดล้อม', '22000000');
INSERT INTO public.divisions VALUES (248, 17, 'สำนักงานเลขานุการ', '22010000');
INSERT INTO public.divisions VALUES (249, 17, 'กองนโยบายและแผนงาน', '22020000');
INSERT INTO public.divisions VALUES (250, 17, 'กองจัดการขยะ ของเสียอันตรายและสิ่งปฏิกูล', '22030000');
INSERT INTO public.divisions VALUES (251, 17, 'กองจัดการคุณภาพอากาศและเสียง', '22040000');
INSERT INTO public.divisions VALUES (252, 17, 'กองโรงงานกำจัดมูลฝอย', '22050000');
INSERT INTO public.divisions VALUES (253, 17, 'สำนักงานสวนสาธารณะ', '22060000');
INSERT INTO public.divisions VALUES (254, 18, 'สำนักวัฒนธรรม กีฬา และการท่องเที่ยว', '23000000');
INSERT INTO public.divisions VALUES (255, 18, 'สำนักงานเลขานุการ', '23010000');
INSERT INTO public.divisions VALUES (256, 18, 'กองนโยบายและแผนงาน', '23020000');
INSERT INTO public.divisions VALUES (257, 18, 'ศูนย์เยาวชนกรุงเทพมหานคร (ไทย - ญี่ปุ่น)', '23030000');
INSERT INTO public.divisions VALUES (258, 18, 'สำนักงานนันทนาการและส่งเสริมการเรียนรู้', '23090000');
INSERT INTO public.divisions VALUES (259, 18, 'กองการกีฬา', '23050000');
INSERT INTO public.divisions VALUES (260, 18, 'กองการสังคีต', '23060000');
INSERT INTO public.divisions VALUES (261, 18, 'กองการท่องเที่ยว', '23070000');
INSERT INTO public.divisions VALUES (262, 18, 'กองวัฒนธรรม', '23080000');
INSERT INTO public.divisions VALUES (263, 19, 'สำนักพัฒนาสังคม', '24000000');
INSERT INTO public.divisions VALUES (264, 19, 'สำนักงานเลขานุการ', '24010000');
INSERT INTO public.divisions VALUES (266, 19, 'กองการพัฒนาชุมชน', '24030000');
INSERT INTO public.divisions VALUES (267, 19, 'กองส่งเสริมอาชีพ', '24040000');
INSERT INTO public.divisions VALUES (268, 19, 'สำนักงานการสงเคราะห์และสวัสดิภาพสังคม', '24050000');
INSERT INTO public.divisions VALUES (269, 24, 'มหาวิทยาลัยกรุงเทพมหานคร', '99000000');
INSERT INTO public.divisions VALUES (270, 24, 'สำนักงานอธิการบดี', '99010000');
INSERT INTO public.divisions VALUES (271, 24, 'สำนักงานสภามหาวิทยาลัย', '99020000');
INSERT INTO public.divisions VALUES (272, 24, 'คณะแพทย์ศาสตร์วชิรพยาบาล', '99030000');
INSERT INTO public.divisions VALUES (273, 24, 'คณะพยาบาลศาสตร์เกื้อการุณย์', '99040000');
INSERT INTO public.divisions VALUES (274, 22, 'ศูนย์รับเรื่องร้องเรียน', '49000000');
INSERT INTO public.divisions VALUES (275, 30, '-', '50010000');
INSERT INTO public.divisions VALUES (276, 31, '-', '50020000');
INSERT INTO public.divisions VALUES (277, 32, '-', '50030000');
INSERT INTO public.divisions VALUES (278, 33, '-', '50040000');
INSERT INTO public.divisions VALUES (279, 34, '-', '50050000');
INSERT INTO public.divisions VALUES (280, 35, '-', '50060000');
INSERT INTO public.divisions VALUES (281, 36, '-', '50070000');
INSERT INTO public.divisions VALUES (282, 37, '-', '50080000');
INSERT INTO public.divisions VALUES (283, 38, '-', '50090000');
INSERT INTO public.divisions VALUES (284, 39, '-', '50100000');
INSERT INTO public.divisions VALUES (285, 40, '-', '50110000');
INSERT INTO public.divisions VALUES (286, 41, '-', '50120000');
INSERT INTO public.divisions VALUES (287, 42, '-', '50130000');
INSERT INTO public.divisions VALUES (288, 43, '-', '50140000');
INSERT INTO public.divisions VALUES (289, 44, '-', '50150000');
INSERT INTO public.divisions VALUES (290, 45, '-', '50160000');
INSERT INTO public.divisions VALUES (291, 46, '-', '50170000');
INSERT INTO public.divisions VALUES (292, 47, '-', '50180000');
INSERT INTO public.divisions VALUES (293, 48, '-', '50190000');
INSERT INTO public.divisions VALUES (294, 49, '-', '50200000');
INSERT INTO public.divisions VALUES (295, 50, '-', '50210000');
INSERT INTO public.divisions VALUES (296, 51, '-', '50220000');
INSERT INTO public.divisions VALUES (297, 52, '-', '50230000');
INSERT INTO public.divisions VALUES (298, 53, '-', '50240000');
INSERT INTO public.divisions VALUES (299, 54, '-', '50250000');
INSERT INTO public.divisions VALUES (300, 55, '-', '50260000');
INSERT INTO public.divisions VALUES (301, 56, '-', '50270000');
INSERT INTO public.divisions VALUES (302, 57, '-', '50280000');
INSERT INTO public.divisions VALUES (303, 58, '-', '50290000');
INSERT INTO public.divisions VALUES (304, 59, '-', '50300000');
INSERT INTO public.divisions VALUES (305, 60, '-', '50310000');
INSERT INTO public.divisions VALUES (306, 61, '-', '50320000');
INSERT INTO public.divisions VALUES (307, 62, '-', '50330000');
INSERT INTO public.divisions VALUES (308, 63, '-', '50340000');
INSERT INTO public.divisions VALUES (309, 64, '-', '50350000');
INSERT INTO public.divisions VALUES (310, 65, '-', '50360000');
INSERT INTO public.divisions VALUES (311, 66, '-', '50370000');
INSERT INTO public.divisions VALUES (312, 67, '-', '50380000');
INSERT INTO public.divisions VALUES (313, 68, '-', '50390000');
INSERT INTO public.divisions VALUES (314, 69, '-', '50400000');
INSERT INTO public.divisions VALUES (315, 70, '-', '50410000');
INSERT INTO public.divisions VALUES (316, 71, '-', '50420000');
INSERT INTO public.divisions VALUES (317, 72, '-', '50430000');
INSERT INTO public.divisions VALUES (318, 73, '-', '50440000');
INSERT INTO public.divisions VALUES (319, 74, '-', '50450000');
INSERT INTO public.divisions VALUES (320, 75, '-', '50460000');
INSERT INTO public.divisions VALUES (321, 76, '-', '50470000');
INSERT INTO public.divisions VALUES (322, 77, '-', '50480000');
INSERT INTO public.divisions VALUES (323, 78, '-', '50490000');
INSERT INTO public.divisions VALUES (324, 79, '-', '50500000');
INSERT INTO public.divisions VALUES (325, 3, 'กองพัฒนาระบบราชการกรุงเทพมหานคร', '03080000');
INSERT INTO public.divisions VALUES (326, 4, 'กองกลาง', '04010000');
INSERT INTO public.divisions VALUES (327, 4, 'กองการเจ้าหน้าที่', '04020000');
INSERT INTO public.divisions VALUES (328, 4, 'กองประชาสัมพันธ์', '04110000');
INSERT INTO public.divisions VALUES (329, 6, 'ศูนย์บริการสาธารณสุข 69 คันนายาว', '08810000');
INSERT INTO public.divisions VALUES (330, 7, 'กองเทคโนโลยีการศึกษา', '09150000');
INSERT INTO public.divisions VALUES (331, 7, 'สถาบันพัฒนาข้าราชการครูและบุคลากรทางการศึกษากรุงเทพมหานคร', '09160000');
INSERT INTO public.divisions VALUES (332, 7, 'กองเสริมสร้างสมรรถนะนักเรียน', '09170000');
INSERT INTO public.divisions VALUES (333, 8, 'สำนักงานควบคุมอาคาร', '10140000');
INSERT INTO public.divisions VALUES (334, 8, 'สำนักงานจัดกรรมสิทธิ์', '10150000');
INSERT INTO public.divisions VALUES (335, 9, 'กองพัฒนาระบบหลัก', '11070000');
INSERT INTO public.divisions VALUES (336, 9, 'สำนักงานอาคารบังคับน้ำ', '11150000');
INSERT INTO public.divisions VALUES (337, 11, 'กองตรวจและปฏิบัติการพื้นที่ 2', '15070000');
INSERT INTO public.divisions VALUES (338, 11, 'กองตรวจและปฏิบัติการพื้นที่ 3', '15080000');
INSERT INTO public.divisions VALUES (339, 11, 'สำนักงานตรวจและบังคับการ', '15100000');
INSERT INTO public.divisions VALUES (340, 12, 'กองระบบเทคโนโลยีจราจร', '17150000');
INSERT INTO public.divisions VALUES (341, 12, 'สำนักงานระบบขนส่ง', '17160000');
INSERT INTO public.divisions VALUES (342, 15, 'กองวิชาการและแผนงาน', '20020000');
INSERT INTO public.divisions VALUES (343, 17, 'สำนักงานจัดการมูลฝอยและสิ่งปฏิกูล', '22070000');
INSERT INTO public.divisions VALUES (344, 17, 'กองกำจัดมูลฝอย', '22080000');
INSERT INTO public.divisions VALUES (345, 18, 'กองนันทนาการ', '23040000');
INSERT INTO public.divisions VALUES (346, 18, 'สำนักงานวัฒนธรรมและการท่องเที่ยว', '23100000');
INSERT INTO public.divisions VALUES (347, 19, 'สำนักงานการพัฒนาชุมชน', '24060000');
INSERT INTO public.divisions VALUES (348, 19, 'สำนักงานการส่งเสริมอาชีพ', '24070000');
INSERT INTO public.divisions VALUES (349, 19, 'สำนักงานสวัสดิการสังคม', '24080000');
INSERT INTO public.divisions VALUES (350, 20, 'สำนักการวางผังและพัฒนาเมือง', '25000000');
INSERT INTO public.divisions VALUES (351, 20, 'สำนักงานเลขานุการ', '25010000');
INSERT INTO public.divisions VALUES (352, 20, 'กองนโยบายและแผนงาน', '25020000');
INSERT INTO public.divisions VALUES (353, 20, 'สำนักงานภูมิสารสนเทศ', '25030000');
INSERT INTO public.divisions VALUES (354, 20, 'สำนักงานวางผังเมือง', '25040000');
INSERT INTO public.divisions VALUES (355, 20, 'สำนักงานพัฒนาและฟื้นฟูเมือง', '25050000');
INSERT INTO public.divisions VALUES (356, 20, 'กองควบคุมผังเมือง', '25060000');
INSERT INTO public.divisions VALUES (357, 23, 'สำนักงานสถาธนานุบาลกรุงเทพมหานคร', '51010000');
INSERT INTO public.divisions VALUES (358, 23, 'สำนักงานตลาดกรุงเทพมหานคร', '51020000');
INSERT INTO public.divisions VALUES (359, 23, 'สำนักงานพัฒนาที่อยู่อาศัย', '51030000');
INSERT INTO public.divisions VALUES (360, 23, 'กองอำนวยการตลาดนัดกรุงเทพมหานคร', '51040000');
INSERT INTO public.divisions VALUES (361, 23, 'บริษัทกรุงเทพธนาคมจำกัด', '51050000');
INSERT INTO public.divisions VALUES (362, 23, 'สถานีวิทยุกระจายเสียงกรุงเทพมหานคร', '51060000');
INSERT INTO public.divisions VALUES (363, 23, 'สหกรณ์ออมทรัพย์กรุงเทพมหานครจำกัด', '51070000');
INSERT INTO public.divisions VALUES (364, 3, 'สถาบันพัฒนาทรัพยากรบุคคลกรุงเทพมหานคร', '03090000');
INSERT INTO public.divisions VALUES (365, 3, 'กองโครงสร้างและอัตรากำลัง', '03100000');
INSERT INTO public.divisions VALUES (366, 3, 'ศูนย์สารเทศทรัพยากรบุคคล', '03110000');
INSERT INTO public.divisions VALUES (367, 21, 'สำนักดิจิทัลกรุงเทพมหานคร', '26000000');
INSERT INTO public.divisions VALUES (368, 21, 'สำนักงานเลขานุการ', '26010000');
INSERT INTO public.divisions VALUES (369, 21, 'กองยุทธศาสตร์ดิจิทัล', '26020000');
INSERT INTO public.divisions VALUES (370, 21, 'กองโครงสร้างพื้นฐานเทคโนโลยีดิจิทัล', '26030000');
INSERT INTO public.divisions VALUES (371, 21, 'สำนักงานพัฒนาระบบสารสนเทศดิจิทัล', '26040000');


--
-- TOC entry 3954 (class 0 OID 16512)
-- Dependencies: 226
-- Data for Name: four_quadrants; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.four_quadrants VALUES (1, 'เพิ่มประสิทธิภาพ');
INSERT INTO public.four_quadrants VALUES (2, 'งานประจำที่บริการประชาชน');
INSERT INTO public.four_quadrants VALUES (3, 'งานหลังบ้านที่เป็นงานใหม่');
INSERT INTO public.four_quadrants VALUES (4, 'ยุทธศาสตร์ / งานอนาคต');


--
-- TOC entry 3956 (class 0 OID 16519)
-- Dependencies: 228
-- Data for Name: meeting_attachment_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.meeting_attachment_types VALUES (1, 'Meeting Document', 'MEETING_DOCUMENT');
INSERT INTO public.meeting_attachment_types VALUES (2, 'Meeting Minutes', 'MEETING_MINUTES');
INSERT INTO public.meeting_attachment_types VALUES (3, 'Supporting Document', 'SUPPORTING_DOCUMENT');


--
-- TOC entry 3995 (class 0 OID 16807)
-- Dependencies: 267
-- Data for Name: meeting_attachments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 3999 (class 0 OID 17143)
-- Dependencies: 271
-- Data for Name: meeting_resolution_revisions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 3958 (class 0 OID 16528)
-- Dependencies: 230
-- Data for Name: meeting_statuses; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.meeting_statuses VALUES (1, 'Scheduled', 'SCHEDULED');
INSERT INTO public.meeting_statuses VALUES (2, 'In Progress', 'IN_PROGRESS');
INSERT INTO public.meeting_statuses VALUES (3, 'Completed', 'COMPLETED');
INSERT INTO public.meeting_statuses VALUES (4, 'Cancelled', 'CANCELLED');
INSERT INTO public.meeting_statuses VALUES (5, 'Draft', 'DRAFT');


--
-- TOC entry 3960 (class 0 OID 16537)
-- Dependencies: 232
-- Data for Name: meeting_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.meeting_types VALUES (1, 'Small Board', 'SMALL_BOARD');
INSERT INTO public.meeting_types VALUES (2, 'Big Board', 'BIG_BOARD');

--
-- TOC entry 3962 (class 0 OID 16546)
-- Dependencies: 234
-- Data for Name: project_attachment_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.project_attachment_types VALUES (1, 'SYSTEM_DIAGRAM', 'system_diagram');
INSERT INTO public.project_attachment_types VALUES (2, 'NETWORK_DIAGRAM', 'network_diagram');
INSERT INTO public.project_attachment_types VALUES (3, 'USE_CASE_DIAGRAM', 'use_case_diagram');
INSERT INTO public.project_attachment_types VALUES (4, 'SECURITY_DIAGRAM', 'security_diagram');
INSERT INTO public.project_attachment_types VALUES (5, 'PRESENTATION', 'presentation');
INSERT INTO public.project_attachment_types VALUES (6, 'REPORT', 'report');
INSERT INTO public.project_attachment_types VALUES (7, 'EXPENSE_DOCUMENT', 'ใบเบิกเงิน');
INSERT INTO public.project_attachment_types VALUES (8, 'OTHER', 'other');
INSERT INTO public.project_attachment_types VALUES (9, 'QUOTATION', 'quotation');
INSERT INTO public.project_attachment_types VALUES (10, 'ONE_PAGE_SUMMARY', 'one_page_summary');
INSERT INTO public.project_attachment_types VALUES (11, 'APPROVAL_DOCUMENT', 'approval_document');
INSERT INTO public.project_attachment_types VALUES (12, 'BMA_DC_USAGE', 'bma_dc_usage');

--
-- TOC entry 3964 (class 0 OID 16557)
-- Dependencies: 236
-- Data for Name: project_statuses; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.project_statuses VALUES (1, 'PROJECT_DRAFT', 'Draft');
INSERT INTO public.project_statuses VALUES (2, 'PROJECT_PENDING_SECRETARY', 'Pending Secretary');
INSERT INTO public.project_statuses VALUES (3, 'PROJECT_RETURNED_SECRETARY', 'Returned by Secretary');
INSERT INTO public.project_statuses VALUES (4, 'PROJECT_REJECTED_SECRETARY', 'Rejected by Secretary');
INSERT INTO public.project_statuses VALUES (5, 'PROJECT_PENDING_ASSIGNMENT', 'Pending Assignment');
INSERT INTO public.project_statuses VALUES (6, 'PROJECT_IN_ANALYSIS', 'In Analysis');
INSERT INTO public.project_statuses VALUES (7, 'PROJECT_RETURNED_ANALYST', 'Returned by Analyst');
INSERT INTO public.project_statuses VALUES (8, 'PROJECT_REJECTED_ANALYST', 'Rejected by Analyst');
INSERT INTO public.project_statuses VALUES (9, 'PROJECT_PENDING_SMALL_BOARD', 'Pending Small Board');
INSERT INTO public.project_statuses VALUES (10, 'PROJECT_RETURNED_FROM_SMALL_BOARD', 'Returned from Small Board');
INSERT INTO public.project_statuses VALUES (11, 'PROJECT_REJECTED_BY_SMALL_BOARD', 'Rejected by Small Board');
INSERT INTO public.project_statuses VALUES (12, 'PROJECT_PENDING_BIG_BOARD', 'Pending Big Board');
INSERT INTO public.project_statuses VALUES (13, 'PROJECT_RETURNED_FROM_BIG_BOARD', 'Returned from Big Board');
INSERT INTO public.project_statuses VALUES (14, 'PROJECT_REJECTED_BY_BIG_BOARD', 'Rejected by Big Board');
INSERT INTO public.project_statuses VALUES (15, 'PROJECT_APPROVED', 'Approved');
INSERT INTO public.project_statuses VALUES (16, 'PROJECT_ACKNOWLEDGED', 'Acknowledged');


--
-- TOC entry 3966 (class 0 OID 16568)
-- Dependencies: 238
-- Data for Name: project_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.project_types VALUES (1, 'HARDWARE', 'คณะกรรมการพิจารณากลั่นกรองโครงการด้านโครงสร้างพื้นฐานดิจิทัลกรุงเทพมหานคร');
INSERT INTO public.project_types VALUES (2, 'SOFTWARE', 'คณะกรรมการพิจารณากลั่นกรองโครงการด้านการพัฒนาระบบสารสนเทศดิจิทัลกรุงเทพมหานคร');

--
-- TOC entry 3968 (class 0 OID 16579)
-- Dependencies: 240
-- Data for Name: resolution_statuses; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.resolution_statuses VALUES (1, 'Approved', 'APPROVED');
INSERT INTO public.resolution_statuses VALUES (2, 'Conditional Approval', 'CONDITIONAL_APPROVAL');
INSERT INTO public.resolution_statuses VALUES (3, 'Not Approved', 'NOT_APPROVED');
INSERT INTO public.resolution_statuses VALUES (4, 'Acknowledged', 'ACKNOWLEDGED');
INSERT INTO public.resolution_statuses VALUES (5, 'Pending (Legacy)', 'PENDING_LEGACY');
INSERT INTO public.resolution_statuses VALUES (6, 'Reconsider', 'RECONSIDER');
INSERT INTO public.resolution_statuses VALUES (7, 'Not Considered', 'NOT_CONSIDERED');


--
-- TOC entry 3969 (class 0 OID 16587)
-- Dependencies: 241
-- Data for Name: role_user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.role_user VALUES ('019fb671-e5d5-7133-80f7-b82404a5b474', 5, '019fb671-e5d5-7133-80f7-b82404a5b474', '2026-07-31 04:33:43.835483');
INSERT INTO public.role_user VALUES ('019fb671-e5d5-7133-80f7-b82404a5b474', 4, '019fb671-e5d5-7133-80f7-b82404a5b474', '2026-07-31 04:33:43.835483');
INSERT INTO public.role_user VALUES ('019fb671-e5d5-7133-80f7-b82404a5b474', 2, '019fb671-e5d5-7133-80f7-b82404a5b474', '2026-07-31 04:33:43.835483');
INSERT INTO public.role_user VALUES ('019fb671-e5d5-7133-80f7-b82404a5b474', 3, '019fb671-e5d5-7133-80f7-b82404a5b474', '2026-07-31 04:33:43.835483');
INSERT INTO public.role_user VALUES ('019fb671-e5d5-7133-80f7-b82404a5b474', 1, '019fb671-e5d5-7133-80f7-b82404a5b474', '2026-07-31 04:33:43.835483');


--
-- TOC entry 3971 (class 0 OID 16594)
-- Dependencies: 243
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.roles VALUES (1, 'USER', 'USER', NULL);
INSERT INTO public.roles VALUES (2, 'ANALYST', 'ANALYST', NULL);
INSERT INTO public.roles VALUES (3, 'SECRETARY', 'SECRETARY', NULL);
INSERT INTO public.roles VALUES (4, 'ADMIN', 'ADMIN', NULL);
INSERT INTO public.roles VALUES (5, 'SUPER_ADMIN', 'SUPER_ADMIN', NULL);


--
-- TOC entry 3973 (class 0 OID 16613)
-- Dependencies: 245
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES ('019fb671-e5d5-7133-80f7-b82404a5b474', 'SUPER_ADMIN', '$argon2id$v=19$m=65536,t=2,p=1$ZfAfPvHAFUdo7c8Yfdk18efM4r12GPdfxC3OvWjX4MA$zAa5trPDWNwAEQ3ULfg85S826HmCQhOaP5Y88uP9xs8', 'Super', 'Admin', 'bma.dsdstrategy@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, true, NULL, NULL, '2026-07-31 04:32:25.548666', '2026-07-31 04:32:25.548666');


--
-- TOC entry 4027 (class 0 OID 0)
-- Dependencies: 219
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 79, true);


--
-- TOC entry 4028 (class 0 OID 0)
-- Dependencies: 221
-- Name: deputy_governors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.deputy_governors_id_seq', 1, false);


--
-- TOC entry 4029 (class 0 OID 0)
-- Dependencies: 223
-- Name: divisions_division_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.divisions_division_id_seq', 371, true);


--
-- TOC entry 4030 (class 0 OID 0)
-- Dependencies: 225
-- Name: four_quadrants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.four_quadrants_id_seq', 1, false);


--
-- TOC entry 4031 (class 0 OID 0)
-- Dependencies: 227
-- Name: meeting_attachment_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.meeting_attachment_types_id_seq', 1, false);


--
-- TOC entry 4032 (class 0 OID 0)
-- Dependencies: 229
-- Name: meeting_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.meeting_statuses_id_seq', 5, true);


--
-- TOC entry 4033 (class 0 OID 0)
-- Dependencies: 231
-- Name: meeting_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.meeting_types_id_seq', 1, false);


--
-- TOC entry 4034 (class 0 OID 0)
-- Dependencies: 233
-- Name: project_attachment_types_doc_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_attachment_types_doc_type_id_seq', 12, true);


--
-- TOC entry 4035 (class 0 OID 0)
-- Dependencies: 235
-- Name: project_statuses_project_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_statuses_project_status_id_seq', 16, true);


--
-- TOC entry 4036 (class 0 OID 0)
-- Dependencies: 237
-- Name: project_types_project_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_types_project_type_id_seq', 1, false);


--
-- TOC entry 4037 (class 0 OID 0)
-- Dependencies: 239
-- Name: resolution_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.resolution_statuses_id_seq', 1, false);


--
-- TOC entry 4038 (class 0 OID 0)
-- Dependencies: 242
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 1, false);


--
-- TOC entry 3575 (class 2606 OID 17222)
-- Name: agenda_types agenda_types_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_types
    ADD CONSTRAINT agenda_types_code_unique UNIQUE (code);


--
-- TOC entry 3577 (class 2606 OID 16485)
-- Name: agenda_types agenda_types_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_types
    ADD CONSTRAINT agenda_types_name_unique UNIQUE (name);


--
-- TOC entry 3579 (class 2606 OID 16483)
-- Name: agenda_types agenda_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_types
    ADD CONSTRAINT agenda_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3713 (class 2606 OID 16806)
-- Name: agendas agendas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendas
    ADD CONSTRAINT agendas_pkey PRIMARY KEY (id);


--
-- TOC entry 3582 (class 2606 OID 17114)
-- Name: departments departments_department_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_department_code_unique UNIQUE (department_code);


--
-- TOC entry 3584 (class 2606 OID 16494)
-- Name: departments departments_department_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_department_name_unique UNIQUE (department_name);


--
-- TOC entry 3586 (class 2606 OID 16492)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- TOC entry 3588 (class 2606 OID 16501)
-- Name: deputy_governors deputy_governors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deputy_governors
    ADD CONSTRAINT deputy_governors_pkey PRIMARY KEY (id);


--
-- TOC entry 3592 (class 2606 OID 17116)
-- Name: divisions divisions_division_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_division_code_unique UNIQUE (division_code);


--
-- TOC entry 3594 (class 2606 OID 16508)
-- Name: divisions divisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_pkey PRIMARY KEY (division_id);


--
-- TOC entry 3596 (class 2606 OID 16517)
-- Name: four_quadrants four_quadrants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.four_quadrants
    ADD CONSTRAINT four_quadrants_pkey PRIMARY KEY (id);


--
-- TOC entry 3598 (class 2606 OID 17224)
-- Name: meeting_attachment_types meeting_attachment_types_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_attachment_types
    ADD CONSTRAINT meeting_attachment_types_code_unique UNIQUE (code);


--
-- TOC entry 3600 (class 2606 OID 16526)
-- Name: meeting_attachment_types meeting_attachment_types_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_attachment_types
    ADD CONSTRAINT meeting_attachment_types_name_unique UNIQUE (name);


--
-- TOC entry 3602 (class 2606 OID 16524)
-- Name: meeting_attachment_types meeting_attachment_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_attachment_types
    ADD CONSTRAINT meeting_attachment_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3717 (class 2606 OID 16814)
-- Name: meeting_attachments meeting_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_attachments
    ADD CONSTRAINT meeting_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 3732 (class 2606 OID 17151)
-- Name: meeting_resolution_revisions meeting_resolution_revisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_resolution_revisions
    ADD CONSTRAINT meeting_resolution_revisions_pkey PRIMARY KEY (id);


--
-- TOC entry 3604 (class 2606 OID 17226)
-- Name: meeting_statuses meeting_statuses_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_statuses
    ADD CONSTRAINT meeting_statuses_code_unique UNIQUE (code);


--
-- TOC entry 3606 (class 2606 OID 16535)
-- Name: meeting_statuses meeting_statuses_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_statuses
    ADD CONSTRAINT meeting_statuses_name_unique UNIQUE (name);


--
-- TOC entry 3608 (class 2606 OID 16533)
-- Name: meeting_statuses meeting_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_statuses
    ADD CONSTRAINT meeting_statuses_pkey PRIMARY KEY (id);


--
-- TOC entry 3610 (class 2606 OID 17228)
-- Name: meeting_types meeting_types_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_types
    ADD CONSTRAINT meeting_types_code_unique UNIQUE (code);


--
-- TOC entry 3612 (class 2606 OID 16544)
-- Name: meeting_types meeting_types_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_types
    ADD CONSTRAINT meeting_types_name_unique UNIQUE (name);


--
-- TOC entry 3614 (class 2606 OID 16542)
-- Name: meeting_types meeting_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_types
    ADD CONSTRAINT meeting_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3719 (class 2606 OID 16823)
-- Name: meetings meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_pkey PRIMARY KEY (id);


--
-- TOC entry 3616 (class 2606 OID 16553)
-- Name: project_attachment_types project_attachment_types_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_attachment_types
    ADD CONSTRAINT project_attachment_types_code_unique UNIQUE (code);


--
-- TOC entry 3618 (class 2606 OID 16555)
-- Name: project_attachment_types project_attachment_types_doc_type_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_attachment_types
    ADD CONSTRAINT project_attachment_types_doc_type_name_unique UNIQUE (doc_type_name);


--
-- TOC entry 3620 (class 2606 OID 16551)
-- Name: project_attachment_types project_attachment_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_attachment_types
    ADD CONSTRAINT project_attachment_types_pkey PRIMARY KEY (doc_type_id);


--
-- TOC entry 3660 (class 2606 OID 16639)
-- Name: project_attachments project_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_attachments
    ADD CONSTRAINT project_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 3662 (class 2606 OID 16645)
-- Name: project_sequences project_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_sequences
    ADD CONSTRAINT project_sequences_pkey PRIMARY KEY (year);


--
-- TOC entry 3729 (class 2606 OID 16843)
-- Name: project_status_logs project_status_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3622 (class 2606 OID 16564)
-- Name: project_statuses project_statuses_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_statuses
    ADD CONSTRAINT project_statuses_code_unique UNIQUE (code);


--
-- TOC entry 3624 (class 2606 OID 16562)
-- Name: project_statuses project_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_statuses
    ADD CONSTRAINT project_statuses_pkey PRIMARY KEY (project_status_id);


--
-- TOC entry 3626 (class 2606 OID 16566)
-- Name: project_statuses project_statuses_project_status_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_statuses
    ADD CONSTRAINT project_statuses_project_status_name_unique UNIQUE (project_status_name);


--
-- TOC entry 3628 (class 2606 OID 16575)
-- Name: project_types project_types_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_types
    ADD CONSTRAINT project_types_code_unique UNIQUE (code);


--
-- TOC entry 3630 (class 2606 OID 16573)
-- Name: project_types project_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_types
    ADD CONSTRAINT project_types_pkey PRIMARY KEY (project_type_id);


--
-- TOC entry 3632 (class 2606 OID 16577)
-- Name: project_types project_types_project_type_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_types
    ADD CONSTRAINT project_types_project_type_name_unique UNIQUE (project_type_name);


--
-- TOC entry 3665 (class 2606 OID 16660)
-- Name: projects projects_external_task_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_external_task_id_unique UNIQUE (external_task_id);


--
-- TOC entry 3667 (class 2606 OID 16656)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);


--
-- TOC entry 3669 (class 2606 OID 16658)
-- Name: projects projects_project_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_project_code_unique UNIQUE (project_code);


--
-- TOC entry 3671 (class 2606 OID 16662)
-- Name: projects projects_public_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_public_token_unique UNIQUE (public_token);


--
-- TOC entry 3678 (class 2606 OID 16679)
-- Name: proposal_budgets proposal_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_budgets
    ADD CONSTRAINT proposal_budgets_pkey PRIMARY KEY (id);


--
-- TOC entry 3680 (class 2606 OID 16686)
-- Name: proposal_cloud_requests proposal_cloud_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_cloud_requests
    ADD CONSTRAINT proposal_cloud_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 3682 (class 2606 OID 16698)
-- Name: proposal_cloud_vms proposal_cloud_vms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_cloud_vms
    ADD CONSTRAINT proposal_cloud_vms_pkey PRIMARY KEY (id);


--
-- TOC entry 3674 (class 2606 OID 16672)
-- Name: proposal_drafts proposal_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_drafts
    ADD CONSTRAINT proposal_drafts_pkey PRIMARY KEY (draft_id);


--
-- TOC entry 3676 (class 2606 OID 16674)
-- Name: proposal_drafts proposal_drafts_project_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_drafts
    ADD CONSTRAINT proposal_drafts_project_id_unique UNIQUE (project_id);


--
-- TOC entry 3684 (class 2606 OID 16705)
-- Name: proposal_existing_equipments proposal_existing_equipments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_existing_equipments
    ADD CONSTRAINT proposal_existing_equipments_pkey PRIMARY KEY (id);


--
-- TOC entry 3686 (class 2606 OID 16712)
-- Name: proposal_hardware_costs proposal_hardware_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_hardware_costs
    ADD CONSTRAINT proposal_hardware_costs_pkey PRIMARY KEY (id);


--
-- TOC entry 3688 (class 2606 OID 16719)
-- Name: proposal_ict_personnel proposal_ict_personnel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_ict_personnel
    ADD CONSTRAINT proposal_ict_personnel_pkey PRIMARY KEY (id);


--
-- TOC entry 3690 (class 2606 OID 16724)
-- Name: proposal_manpower proposal_manpower_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_manpower
    ADD CONSTRAINT proposal_manpower_pkey PRIMARY KEY (id);


--
-- TOC entry 3692 (class 2606 OID 16731)
-- Name: proposal_other_costs proposal_other_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_other_costs
    ADD CONSTRAINT proposal_other_costs_pkey PRIMARY KEY (id);


--
-- TOC entry 3694 (class 2606 OID 16738)
-- Name: proposal_personnel_costs proposal_personnel_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_personnel_costs
    ADD CONSTRAINT proposal_personnel_costs_pkey PRIMARY KEY (id);


--
-- TOC entry 3696 (class 2606 OID 16745)
-- Name: proposal_personnel_responsibilities proposal_personnel_responsibilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_personnel_responsibilities
    ADD CONSTRAINT proposal_personnel_responsibilities_pkey PRIMARY KEY (id);


--
-- TOC entry 3698 (class 2606 OID 16752)
-- Name: proposal_related_projects proposal_related_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_related_projects
    ADD CONSTRAINT proposal_related_projects_pkey PRIMARY KEY (id);


--
-- TOC entry 3700 (class 2606 OID 16759)
-- Name: proposal_software_costs proposal_software_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_software_costs
    ADD CONSTRAINT proposal_software_costs_pkey PRIMARY KEY (id);


--
-- TOC entry 3702 (class 2606 OID 16764)
-- Name: proposal_training_food_costs proposal_training_food_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_training_food_costs
    ADD CONSTRAINT proposal_training_food_costs_pkey PRIMARY KEY (id);


--
-- TOC entry 3704 (class 2606 OID 16771)
-- Name: proposal_training_speaker_costs proposal_training_speaker_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_training_speaker_costs
    ADD CONSTRAINT proposal_training_speaker_costs_pkey PRIMARY KEY (id);


--
-- TOC entry 3706 (class 2606 OID 16779)
-- Name: proposal_trainings proposal_trainings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_trainings
    ADD CONSTRAINT proposal_trainings_pkey PRIMARY KEY (id);


--
-- TOC entry 3708 (class 2606 OID 16795)
-- Name: proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (id);


--
-- TOC entry 3634 (class 2606 OID 17230)
-- Name: resolution_statuses resolution_statuses_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolution_statuses
    ADD CONSTRAINT resolution_statuses_code_unique UNIQUE (code);


--
-- TOC entry 3636 (class 2606 OID 16586)
-- Name: resolution_statuses resolution_statuses_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolution_statuses
    ADD CONSTRAINT resolution_statuses_name_unique UNIQUE (name);


--
-- TOC entry 3638 (class 2606 OID 16584)
-- Name: resolution_statuses resolution_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolution_statuses
    ADD CONSTRAINT resolution_statuses_pkey PRIMARY KEY (id);


--
-- TOC entry 3722 (class 2606 OID 16834)
-- Name: resolutions resolutions_agenda_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_agenda_id_unique UNIQUE (agenda_id);


--
-- TOC entry 3726 (class 2606 OID 16832)
-- Name: resolutions resolutions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_pkey PRIMARY KEY (id);


--
-- TOC entry 3640 (class 2606 OID 16592)
-- Name: role_user role_user_user_id_role_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_user_id_role_id_pk PRIMARY KEY (user_id, role_id);


--
-- TOC entry 3642 (class 2606 OID 16601)
-- Name: roles roles_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_code_unique UNIQUE (code);


--
-- TOC entry 3644 (class 2606 OID 16599)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- TOC entry 3646 (class 2606 OID 16603)
-- Name: roles roles_role_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_unique UNIQUE (role_name);


--
-- TOC entry 3648 (class 2606 OID 16612)
-- Name: user_login_history user_login_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_login_history
    ADD CONSTRAINT user_login_history_pkey PRIMARY KEY (id);


--
-- TOC entry 3650 (class 2606 OID 16627)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 3652 (class 2606 OID 16623)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3654 (class 2606 OID 16629)
-- Name: users users_reset_password_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_reset_password_token_unique UNIQUE (reset_password_token);


--
-- TOC entry 3656 (class 2606 OID 16625)
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- TOC entry 3658 (class 2606 OID 16631)
-- Name: users users_verification_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_verification_token_unique UNIQUE (verification_token);


--
-- TOC entry 3739 (class 2606 OID 17160)
-- Name: workflow_audit_events workflow_audit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_audit_events
    ADD CONSTRAINT workflow_audit_events_pkey PRIMARY KEY (id);


--
-- TOC entry 3710 (class 1259 OID 17232)
-- Name: agendas_meeting_project_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX agendas_meeting_project_idx ON public.agendas USING btree (meeting_id, project_id) WHERE (project_id IS NOT NULL);


--
-- TOC entry 3711 (class 1259 OID 17231)
-- Name: agendas_meeting_sort_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX agendas_meeting_sort_order_idx ON public.agendas USING btree (meeting_id, sort_order);


--
-- TOC entry 3714 (class 1259 OID 17215)
-- Name: agendas_project_meeting_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX agendas_project_meeting_idx ON public.agendas USING btree (project_id, meeting_id);


--
-- TOC entry 3580 (class 1259 OID 17111)
-- Name: departments_department_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX departments_department_code_idx ON public.departments USING btree (department_code);


--
-- TOC entry 3589 (class 1259 OID 17110)
-- Name: divisions_department_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX divisions_department_id_idx ON public.divisions USING btree (department_id);


--
-- TOC entry 3590 (class 1259 OID 17112)
-- Name: divisions_division_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX divisions_division_code_idx ON public.divisions USING btree (division_code);


--
-- TOC entry 3715 (class 1259 OID 17216)
-- Name: meeting_attachments_meeting_document_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX meeting_attachments_meeting_document_idx ON public.meeting_attachments USING btree (meeting_id, document_type);


--
-- TOC entry 3733 (class 1259 OID 17242)
-- Name: meeting_resolution_revisions_project_changed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX meeting_resolution_revisions_project_changed_idx ON public.meeting_resolution_revisions USING btree (project_id, changed_at);


--
-- TOC entry 3734 (class 1259 OID 17196)
-- Name: meeting_resolution_revisions_project_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX meeting_resolution_revisions_project_idx ON public.meeting_resolution_revisions USING btree (project_id, changed_at);


--
-- TOC entry 3735 (class 1259 OID 17195)
-- Name: meeting_resolution_revisions_resolution_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX meeting_resolution_revisions_resolution_idx ON public.meeting_resolution_revisions USING btree (resolution_id, revision_number);


--
-- TOC entry 3720 (class 1259 OID 17217)
-- Name: meetings_workflow_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX meetings_workflow_idx ON public.meetings USING btree (meeting_type_id, meeting_status_id, meeting_date);


--
-- TOC entry 3727 (class 1259 OID 17220)
-- Name: project_status_logs_meeting_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX project_status_logs_meeting_idx ON public.project_status_logs USING btree (meeting_id, agenda_id, resolution_id);


--
-- TOC entry 3730 (class 1259 OID 17219)
-- Name: project_status_logs_project_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX project_status_logs_project_status_idx ON public.project_status_logs USING btree (project_id, new_status_id);


--
-- TOC entry 3663 (class 1259 OID 17239)
-- Name: projects_analyst_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_analyst_status_idx ON public.projects USING btree (analyst_id, project_status_id);


--
-- TOC entry 3672 (class 1259 OID 17238)
-- Name: projects_status_budget_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_status_budget_idx ON public.projects USING btree (project_status_id, latest_requested_budget);


--
-- TOC entry 3709 (class 1259 OID 17240)
-- Name: proposals_project_status_submitted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX proposals_project_status_submitted_idx ON public.proposals USING btree (project_id, status, submitted_at, id);


--
-- TOC entry 3723 (class 1259 OID 17218)
-- Name: resolutions_agenda_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX resolutions_agenda_idx ON public.resolutions USING btree (agenda_id);


--
-- TOC entry 3724 (class 1259 OID 17241)
-- Name: resolutions_governed_proposal_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX resolutions_governed_proposal_idx ON public.resolutions USING btree (governed_proposal_id);


--
-- TOC entry 3736 (class 1259 OID 17198)
-- Name: workflow_audit_events_actor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_audit_events_actor_idx ON public.workflow_audit_events USING btree (actor_id, created_at);


--
-- TOC entry 3737 (class 1259 OID 17197)
-- Name: workflow_audit_events_entity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_audit_events_entity_idx ON public.workflow_audit_events USING btree (entity_type, entity_id, created_at);


--
-- TOC entry 3775 (class 2606 OID 17029)
-- Name: agendas agendas_agenda_type_id_agenda_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendas
    ADD CONSTRAINT agendas_agenda_type_id_agenda_types_id_fk FOREIGN KEY (agenda_type_id) REFERENCES public.agenda_types(id);


--
-- TOC entry 3776 (class 2606 OID 17019)
-- Name: agendas agendas_meeting_id_meetings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendas
    ADD CONSTRAINT agendas_meeting_id_meetings_id_fk FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE;


--
-- TOC entry 3777 (class 2606 OID 17024)
-- Name: agendas agendas_project_id_projects_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendas
    ADD CONSTRAINT agendas_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- TOC entry 3740 (class 2606 OID 16844)
-- Name: divisions divisions_department_id_departments_department_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- TOC entry 3778 (class 2606 OID 17039)
-- Name: meeting_attachments meeting_attachments_agenda_id_agendas_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_attachments
    ADD CONSTRAINT meeting_attachments_agenda_id_agendas_id_fk FOREIGN KEY (agenda_id) REFERENCES public.agendas(id) ON DELETE CASCADE;


--
-- TOC entry 3779 (class 2606 OID 17044)
-- Name: meeting_attachments meeting_attachments_meeting_doc_type_id_meeting_attachment_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_attachments
    ADD CONSTRAINT meeting_attachments_meeting_doc_type_id_meeting_attachment_type FOREIGN KEY (meeting_doc_type_id) REFERENCES public.meeting_attachment_types(id);


--
-- TOC entry 3780 (class 2606 OID 17034)
-- Name: meeting_attachments meeting_attachments_meeting_id_meetings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_attachments
    ADD CONSTRAINT meeting_attachments_meeting_id_meetings_id_fk FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE;


--
-- TOC entry 3781 (class 2606 OID 17049)
-- Name: meeting_attachments meeting_attachments_uploaded_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_attachments
    ADD CONSTRAINT meeting_attachments_uploaded_by_users_user_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(user_id);


--
-- TOC entry 3797 (class 2606 OID 17185)
-- Name: meeting_resolution_revisions meeting_resolution_revisions_changed_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_resolution_revisions
    ADD CONSTRAINT meeting_resolution_revisions_changed_by_users_user_id_fk FOREIGN KEY (changed_by) REFERENCES public.users(user_id);


--
-- TOC entry 3798 (class 2606 OID 17180)
-- Name: meeting_resolution_revisions meeting_resolution_revisions_new_project_status_id_project_stat; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_resolution_revisions
    ADD CONSTRAINT meeting_resolution_revisions_new_project_status_id_project_stat FOREIGN KEY (new_project_status_id) REFERENCES public.project_statuses(project_status_id);


--
-- TOC entry 3799 (class 2606 OID 17175)
-- Name: meeting_resolution_revisions meeting_resolution_revisions_previous_project_status_id_project; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_resolution_revisions
    ADD CONSTRAINT meeting_resolution_revisions_previous_project_status_id_project FOREIGN KEY (previous_project_status_id) REFERENCES public.project_statuses(project_status_id);


--
-- TOC entry 3800 (class 2606 OID 17170)
-- Name: meeting_resolution_revisions meeting_resolution_revisions_project_id_projects_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_resolution_revisions
    ADD CONSTRAINT meeting_resolution_revisions_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- TOC entry 3801 (class 2606 OID 17165)
-- Name: meeting_resolution_revisions meeting_resolution_revisions_resolution_id_resolutions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_resolution_revisions
    ADD CONSTRAINT meeting_resolution_revisions_resolution_id_resolutions_id_fk FOREIGN KEY (resolution_id) REFERENCES public.resolutions(id) ON DELETE CASCADE;


--
-- TOC entry 3782 (class 2606 OID 17064)
-- Name: meetings meetings_created_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_created_by_users_user_id_fk FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- TOC entry 3783 (class 2606 OID 17059)
-- Name: meetings meetings_meeting_status_id_meeting_statuses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_meeting_status_id_meeting_statuses_id_fk FOREIGN KEY (meeting_status_id) REFERENCES public.meeting_statuses(id);


--
-- TOC entry 3784 (class 2606 OID 17054)
-- Name: meetings meetings_meeting_type_id_meeting_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_meeting_type_id_meeting_types_id_fk FOREIGN KEY (meeting_type_id) REFERENCES public.meeting_types(id);


--
-- TOC entry 3785 (class 2606 OID 17069)
-- Name: meetings meetings_updated_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_updated_by_users_user_id_fk FOREIGN KEY (updated_by) REFERENCES public.users(user_id);


--
-- TOC entry 3746 (class 2606 OID 16879)
-- Name: project_attachments project_attachments_doc_type_id_project_attachment_types_doc_ty; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_attachments
    ADD CONSTRAINT project_attachments_doc_type_id_project_attachment_types_doc_ty FOREIGN KEY (doc_type_id) REFERENCES public.project_attachment_types(doc_type_id);


--
-- TOC entry 3747 (class 2606 OID 16874)
-- Name: project_attachments project_attachments_project_id_projects_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_attachments
    ADD CONSTRAINT project_attachments_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- TOC entry 3748 (class 2606 OID 16884)
-- Name: project_attachments project_attachments_uploaded_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_attachments
    ADD CONSTRAINT project_attachments_uploaded_by_users_user_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(user_id);


--
-- TOC entry 3790 (class 2606 OID 17204)
-- Name: project_status_logs project_status_logs_agenda_id_agendas_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_agenda_id_agendas_id_fk FOREIGN KEY (agenda_id) REFERENCES public.agendas(id);


--
-- TOC entry 3791 (class 2606 OID 17199)
-- Name: project_status_logs project_status_logs_meeting_id_meetings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_meeting_id_meetings_id_fk FOREIGN KEY (meeting_id) REFERENCES public.meetings(id);


--
-- TOC entry 3792 (class 2606 OID 17104)
-- Name: project_status_logs project_status_logs_new_status_id_project_statuses_project_stat; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_new_status_id_project_statuses_project_stat FOREIGN KEY (new_status_id) REFERENCES public.project_statuses(project_status_id);


--
-- TOC entry 3793 (class 2606 OID 17099)
-- Name: project_status_logs project_status_logs_old_status_id_project_statuses_project_stat; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_old_status_id_project_statuses_project_stat FOREIGN KEY (old_status_id) REFERENCES public.project_statuses(project_status_id);


--
-- TOC entry 3794 (class 2606 OID 17089)
-- Name: project_status_logs project_status_logs_project_id_projects_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- TOC entry 3795 (class 2606 OID 17209)
-- Name: project_status_logs project_status_logs_resolution_id_resolutions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_resolution_id_resolutions_id_fk FOREIGN KEY (resolution_id) REFERENCES public.resolutions(id);


--
-- TOC entry 3796 (class 2606 OID 17094)
-- Name: project_status_logs project_status_logs_user_id_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_user_id_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3749 (class 2606 OID 16914)
-- Name: projects projects_deputy_governor_id_deputy_governors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_deputy_governor_id_deputy_governors_id_fk FOREIGN KEY (deputy_governor_id) REFERENCES public.deputy_governors(id);


--
-- TOC entry 3750 (class 2606 OID 16894)
-- Name: projects projects_division_id_divisions_division_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_division_id_divisions_division_id_fk FOREIGN KEY (division_id) REFERENCES public.divisions(division_id);


--
-- TOC entry 3751 (class 2606 OID 16909)
-- Name: projects projects_four_quadrants_id_four_quadrants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_four_quadrants_id_four_quadrants_id_fk FOREIGN KEY (four_quadrants_id) REFERENCES public.four_quadrants(id);


--
-- TOC entry 3752 (class 2606 OID 16899)
-- Name: projects projects_project_status_id_project_statuses_project_status_id_f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_project_status_id_project_statuses_project_status_id_f FOREIGN KEY (project_status_id) REFERENCES public.project_statuses(project_status_id);


--
-- TOC entry 3753 (class 2606 OID 16904)
-- Name: projects projects_project_type_id_project_types_project_type_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_project_type_id_project_types_project_type_id_fk FOREIGN KEY (project_type_id) REFERENCES public.project_types(project_type_id);


--
-- TOC entry 3754 (class 2606 OID 16889)
-- Name: projects projects_user_id_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_user_id_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3757 (class 2606 OID 16929)
-- Name: proposal_budgets proposal_budgets_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_budgets
    ADD CONSTRAINT proposal_budgets_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- TOC entry 3758 (class 2606 OID 16934)
-- Name: proposal_cloud_requests proposal_cloud_requests_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_cloud_requests
    ADD CONSTRAINT proposal_cloud_requests_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- TOC entry 3759 (class 2606 OID 16939)
-- Name: proposal_cloud_vms proposal_cloud_vms_cloud_request_id_proposal_cloud_requests_id_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_cloud_vms
    ADD CONSTRAINT proposal_cloud_vms_cloud_request_id_proposal_cloud_requests_id_ FOREIGN KEY (cloud_request_id) REFERENCES public.proposal_cloud_requests(id) ON DELETE CASCADE;


--
-- TOC entry 3755 (class 2606 OID 16919)
-- Name: proposal_drafts proposal_drafts_project_id_projects_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_drafts
    ADD CONSTRAINT proposal_drafts_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- TOC entry 3756 (class 2606 OID 16924)
-- Name: proposal_drafts proposal_drafts_user_id_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_drafts
    ADD CONSTRAINT proposal_drafts_user_id_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3760 (class 2606 OID 16944)
-- Name: proposal_existing_equipments proposal_existing_equipments_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_existing_equipments
    ADD CONSTRAINT proposal_existing_equipments_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- TOC entry 3761 (class 2606 OID 16949)
-- Name: proposal_hardware_costs proposal_hardware_costs_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_hardware_costs
    ADD CONSTRAINT proposal_hardware_costs_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- TOC entry 3762 (class 2606 OID 16954)
-- Name: proposal_ict_personnel proposal_ict_personnel_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_ict_personnel
    ADD CONSTRAINT proposal_ict_personnel_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- TOC entry 3763 (class 2606 OID 16959)
-- Name: proposal_manpower proposal_manpower_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_manpower
    ADD CONSTRAINT proposal_manpower_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- TOC entry 3764 (class 2606 OID 16964)
-- Name: proposal_other_costs proposal_other_costs_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_other_costs
    ADD CONSTRAINT proposal_other_costs_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- TOC entry 3765 (class 2606 OID 16969)
-- Name: proposal_personnel_costs proposal_personnel_costs_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_personnel_costs
    ADD CONSTRAINT proposal_personnel_costs_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- TOC entry 3766 (class 2606 OID 16974)
-- Name: proposal_personnel_responsibilities proposal_personnel_responsibilities_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_personnel_responsibilities
    ADD CONSTRAINT proposal_personnel_responsibilities_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- TOC entry 3767 (class 2606 OID 16979)
-- Name: proposal_related_projects proposal_related_projects_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_related_projects
    ADD CONSTRAINT proposal_related_projects_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- TOC entry 3768 (class 2606 OID 16984)
-- Name: proposal_software_costs proposal_software_costs_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_software_costs
    ADD CONSTRAINT proposal_software_costs_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- TOC entry 3769 (class 2606 OID 16989)
-- Name: proposal_training_food_costs proposal_training_food_costs_training_id_proposal_trainings_id_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_training_food_costs
    ADD CONSTRAINT proposal_training_food_costs_training_id_proposal_trainings_id_ FOREIGN KEY (training_id) REFERENCES public.proposal_trainings(id) ON DELETE CASCADE;


--
-- TOC entry 3770 (class 2606 OID 16994)
-- Name: proposal_training_speaker_costs proposal_training_speaker_costs_training_id_proposal_trainings_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_training_speaker_costs
    ADD CONSTRAINT proposal_training_speaker_costs_training_id_proposal_trainings_ FOREIGN KEY (training_id) REFERENCES public.proposal_trainings(id) ON DELETE CASCADE;


--
-- TOC entry 3771 (class 2606 OID 16999)
-- Name: proposal_trainings proposal_trainings_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_trainings
    ADD CONSTRAINT proposal_trainings_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- TOC entry 3772 (class 2606 OID 17004)
-- Name: proposals proposals_project_id_projects_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- TOC entry 3773 (class 2606 OID 17014)
-- Name: proposals proposals_updated_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_updated_by_users_user_id_fk FOREIGN KEY (updated_by) REFERENCES public.users(user_id);


--
-- TOC entry 3774 (class 2606 OID 17009)
-- Name: proposals proposals_user_id_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_user_id_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3786 (class 2606 OID 17074)
-- Name: resolutions resolutions_agenda_id_agendas_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_agenda_id_agendas_id_fk FOREIGN KEY (agenda_id) REFERENCES public.agendas(id) ON DELETE CASCADE;


--
-- TOC entry 3787 (class 2606 OID 17233)
-- Name: resolutions resolutions_governed_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_governed_proposal_id_proposals_id_fk FOREIGN KEY (governed_proposal_id) REFERENCES public.proposals(id);


--
-- TOC entry 3788 (class 2606 OID 17084)
-- Name: resolutions resolutions_recorded_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_recorded_by_users_user_id_fk FOREIGN KEY (recorded_by) REFERENCES public.users(user_id);


--
-- TOC entry 3789 (class 2606 OID 17079)
-- Name: resolutions resolutions_resolution_status_id_resolution_statuses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_resolution_status_id_resolution_statuses_id_fk FOREIGN KEY (resolution_status_id) REFERENCES public.resolution_statuses(id);


--
-- TOC entry 3741 (class 2606 OID 16859)
-- Name: role_user role_user_assigned_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_assigned_by_users_user_id_fk FOREIGN KEY (assigned_by) REFERENCES public.users(user_id);


--
-- TOC entry 3742 (class 2606 OID 16854)
-- Name: role_user role_user_role_id_roles_role_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_role_id_roles_role_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


--
-- TOC entry 3743 (class 2606 OID 16849)
-- Name: role_user role_user_user_id_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_user_id_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3744 (class 2606 OID 16864)
-- Name: user_login_history user_login_history_user_id_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_login_history
    ADD CONSTRAINT user_login_history_user_id_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3745 (class 2606 OID 16869)
-- Name: users users_division_id_divisions_division_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_division_id_divisions_division_id_fk FOREIGN KEY (division_id) REFERENCES public.divisions(division_id);


--
-- TOC entry 3802 (class 2606 OID 17190)
-- Name: workflow_audit_events workflow_audit_events_actor_id_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_audit_events
    ADD CONSTRAINT workflow_audit_events_actor_id_users_user_id_fk FOREIGN KEY (actor_id) REFERENCES public.users(user_id);


-- Completed on 2026-09-14 13:12:29

--
-- PostgreSQL database dump complete
--

