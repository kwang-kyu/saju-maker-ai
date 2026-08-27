import type {
    ConsultingSessionOwnerId,
  } from "../consultingSessionOwnerId.js";
  
  import type {
    UserSubscription,
  } from "./subscriptionTypes.js";
  
  export interface UserSubscriptionRepository {
    findByUserId(
      userId:
        ConsultingSessionOwnerId,
    ): Promise<UserSubscription | null>;
  
    create(
      subscription:
        UserSubscription,
    ): Promise<void>;
  
    update(
      subscription:
        UserSubscription,
    ): Promise<void>;
  }