import type { SchemaTypeDefinition } from 'sanity';

import { citationClient } from './objects/citationClient';
import { contenu } from './objects/contenu';
import { imageAvecAlt } from './objects/imageAvecAlt';
import { questionReponse } from './objects/questionReponse';

import { commune } from './documents/commune';
import { post } from './documents/post';
import { project } from './documents/project';
import { service } from './documents/service';
import { settings } from './documents/settings';
import { temoignage } from './documents/temoignage';

/** Types réutilisables, composés par les documents. */
const objets = [imageAvecAlt, questionReponse, citationClient, contenu];

/** Documents éditables dans le Studio. */
const documents = [project, service, post, commune, temoignage, settings];

export const schemaTypes: SchemaTypeDefinition[] = [...objets, ...documents];
