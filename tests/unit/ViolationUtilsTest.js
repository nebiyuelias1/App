import Onyx from 'react-native-onyx';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import ONYXKEYS from '@src/ONYXKEYS';

const categoryOutOfPolicyViolation = {
    name: 'categoryOutOfPolicy',
    type: 'violation',
    userMessage: '',
};

const missingCategoryViolation = {
    name: 'missingCategory',
    type: 'violation',
    userMessage: '',
};

const tagOutOfPolicyViolation = {
    name: 'tagOutOfPolicy',
    type: 'violation',
    userMessage: '',
};

const missingTagViolation = {
    name: 'missingTag',
    type: 'violation',
    userMessage: '',
};

describe('getViolationsOnyxData', () => {
    let transaction;
    let transactionViolations;
    let policyRequiresTags;
    let policyTags;
    let policyRequiresCategories;
    let policyCategories;

    beforeEach(() => {
        transaction = {transactionID: '123'};
        transactionViolations = [
            {name: 'duplicatedTransaction', type: 'violation', userMessage: ''},
            {name: 'receiptRequired', type: 'violation', userMessage: ''},
        ];
        policyRequiresTags = false;
        policyTags = {};
        policyRequiresCategories = false;
        policyCategories = {Food: {enabled: true}};
    });

    describe('ordinary operations', () => {
        it('should return an object with correct shape', () => {
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result).toEqual({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
                value: transactionViolations,
            });
        });

        it('should handle single violation', () => {
            const expectedViolation = transactionViolations[0];
            transactionViolations = [expectedViolation];

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual(expect.arrayContaining([expectedViolation]));
        });

        it('should handle empty transactionViolations', () => {
            transactionViolations = [];

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual([]);
        });
    });

    it('should handle empty transaction', () => {
        transaction = {};
        transactionViolations = [];

        const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

        expect(result.value).toEqual([]);
    });

    describe('policyRequiresCategories', () => {
        beforeEach(() => {
            policyRequiresCategories = true;
            transaction.category = 'Food';
        });

        it('should add missingCategory violation if no category is included', () => {
            transaction.category = null;

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual(expect.arrayContaining([missingCategoryViolation, ...transactionViolations]));
        });

        it('should add categoryOutOfPolicy violation when category is not in policy', () => {
            transaction.category = 'Bananas';

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual(expect.arrayContaining([categoryOutOfPolicyViolation, ...transactionViolations]));
        });

        it('should not include a categoryOutOfPolicy violation when category is in policy', () => {
            policyCategories = {Food: {enabled: true}};
            transaction.category = 'Food';

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).not.toContainEqual(categoryOutOfPolicyViolation);
        });

        it('should add categoryOutOfPolicy violation when category is not enabled in policy', () => {
            policyRequiresCategories = true;
            policyCategories = {Food: {enabled: false}};
            transaction.category = 'Food';

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual(expect.arrayContaining([categoryOutOfPolicyViolation, ...transactionViolations]));
        });

        it('should not add a categoryOutOfPolicy violation when categories are not required', () => {
            policyRequiresCategories = false;
            policyCategories = {Food: {enabled: true}};
            transaction.category = 'Drinks';

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).not.toContainEqual([categoryOutOfPolicyViolation]);
        });
    });

    describe('policyRequiresTags', () => {
        beforeEach(() => {
            policyRequiresTags = true;
            policyTags = {Lunch: {enabled: true}, Dinner: {enabled: true}};
            transaction.tag = 'Lunch';
        });

        it("shouldn't update the transactionViolations if the policy requires tags and the transaction has a tag from the policy", () => {
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual(transactionViolations);
        });

        it('should add a missingTag violation if none is provided and policy requires tags', () => {
            transaction.tag = undefined;

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual(expect.arrayContaining([missingTagViolation]));
        });

        it('should add a tagOutOfPolicy violation when policy requires tags and tag is not in the policy', () => {
            policyTags = {};

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual(expect.arrayContaining([tagOutOfPolicyViolation]));
        });

        it('should add tagOutOfPolicy violation when policy requires tags and tag is not enabled in the policy', () => {
            policyRequiresTags = true;
            policyTags = {Lunch: {enabled: false}};

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual(expect.arrayContaining([tagOutOfPolicyViolation]));
        });
    });
});
