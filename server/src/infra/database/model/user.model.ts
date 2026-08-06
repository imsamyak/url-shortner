import { User } from "../../../domain/entity/user.entity";

export interface UserItem extends User {
  pk: `USER#${string}`;
  sk: "META";
  gsi1pk: `EMAIL#${string}`;
  gsi1sk: `META`;
  createdAt: string;
}

export interface UserTrackerItem {
    pk: `EMAIL#${string}`,
    sk: "TRACKER",
    userId: string,
}
