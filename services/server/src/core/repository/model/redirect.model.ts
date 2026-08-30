import { Redirect } from "../../../domain/entity/redirect.entity";

export interface RedirectItem extends Redirect {
  pk: `REDIRECT#${string}`;
  sk: `META`;
  gsi1pk: `AUTHOR#${string}`;
  gsi1sk: `DATE#${string}`;
  author: string;
  createdAt: string;
}
