import * as ulearnApi from './apis/ulearnApi';
import { Group } from './apis/ulearnApi';

export default async function copyGroupsAsync(
  courseId: string,
  groupNames: string[],
  destinationCourseId: string,
  makeMeOwner: boolean,
  scoringGroups: ulearnApi.ScoringGroup[],
  reviewMode: ReviewMode = 'perfect',
  isInviteLinkEnabled: boolean = false,
  canStudentsSeeGroupProgress: boolean = true
) {
  const existingGroups = await ulearnApi.getGroupsAsync(courseId);
  for (const groupName of groupNames) {
    const existingGroup = existingGroups.filter(g => g.name === groupName)[0];
    if (existingGroup) {
      await copyGroupAsync(
        existingGroup,
        destinationCourseId,
        makeMeOwner,
        scoringGroups,
        reviewMode,
        isInviteLinkEnabled,
        canStudentsSeeGroupProgress
      );
    } else {
      console.log(`Group '${groupName}' was not found in course '${courseId}'`);
    }
  }
}

async function copyGroupAsync(
  exsistingGroup: Group,
  destinationCourseId: string,
  makeMeOwner: boolean,
  scoringGroups: ulearnApi.ScoringGroup[],
  reviewMode: ReviewMode,
  isInviteLinkEnabled: boolean,
  canStudentsSeeGroupProgress: boolean
): Promise<Group> {
  try {
    const groupInfo = await ulearnApi.copyGroupAsync(
      exsistingGroup.id,
      destinationCourseId,
      makeMeOwner
    );
    console.log(
      `Group '${exsistingGroup.name}' was copied to '${destinationCourseId}' with id=${groupInfo.id}`
    );

    const patch = {
      isInviteLinkEnabled,
      isManualCheckingEnabled: reviewMode !== 'no',
      isManualCheckingEnabledForOldSolutions:
        reviewMode === 'perfect' || reviewMode === 'all',
      defaultProhibitFurtherReview:
        reviewMode !== 'continuous' && reviewMode !== 'all',
      canStudentsSeeGroupProgress,
    };
    const group = await ulearnApi.patchGroupAsync(groupInfo.id, patch);

    await ulearnApi.postGroupScoresAsync(group.id, scoringGroups);

    console.log(`    and was configured`);

    return group;
  } catch (e) {
    console.log(
      `An error occured while creating or configuring group '${exsistingGroup.name}'...`
    );
    return null;
  }
}

export type ReviewMode = 'no' | 'single' | 'continuous' | 'perfect' | 'all';
