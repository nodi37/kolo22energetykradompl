
/////////////////////////////////////////////////////////////////////////
//////////////////////API VALIDATION SCHEMES/////////////////////////////
const rankingImageUploadSchema = {
    type: "object",
    properties: {
        "year": { type: "string" },
        "text": { type: "string" }
    },
    required: ["year", "text"],
    additionalProperties: false
}

const deleteCompetitionSchema = {
    type: "object",
    properties: {
        "id": { type: "string" }
    },
    required: ["id"],
    additionalProperties: false
}

const createCompetitionSchema = {
    type: "object",
    properties: {
        "dateValue": { type: "string" },
        "titleValue": { type: "string" },
        "descValue": { type: "string" }
    },
    required: ["dateValue", "titleValue", "descValue"],
    additionalProperties: false
}

const captchaSchema = {
    type: "object",
    properties: {
        "token": { type: "string" }
    },
    required: ["token"],
    additionalProperties: false
}

const logoDeleteSchema = {
    type: "object",
    properties: {
        "lName": { type: "string" }
    },
    required: ["lName"],
    additionalProperties: false
}

const postCreateSchema = {
    type: "object",
    properties: {
        "galleryId": { type: "string" },
        "pName": { type: "string" },
        "pDscShort": { type: "string" },
        "pDscLong": { type: "string" },
        "mainImage": { type: "string" }
    },
    required: ["pName"],
    additionalProperties: false
}

const imageUploadSchema = {
    type: "object",
    properties: {
        "postImage": { type: "string" },
        "href": { type: "string" },
        "gId": { type: "string" }
    },
    required: ["postImage"],
    additionalProperties: false
}


const loginSchema = {
    type: "object",
    properties: {
        "email": { type: "string" },
        "password": { type: "string" }
    },
    required: ["email", "password"],
    additionalProperties: false
}

const saveDescriptionsSchema = {
    type: "object",
    properties: {
        "notice": { type: "string" },
        "noticeTitle": { type: "string" },
        "history": { type: "string" },
        "mainHeader": { type: "string" },
        "descriptionTop": { type: "string" },
        "descriptionBottom": { type: "string" }
    },
    additionalProperties: false
}

const changeVisibilitySchema = {
    type: "object",
    properties: {
        "id": { type: "string" }
    },
    required: ["id"],
    additionalProperties: false
}

const publicPostsSchema = {
    type: "object",
    properties: {
        "query": { type: "string" },
        "postsLoaded": { type: "string" },
        "toLoad": { type: "string" }
    },
    required: ["query", "postsLoaded", "toLoad"],
    additionalProperties: false
}
const singlePostSchema = {
    type: "object",
    properties: {
        "year": { type: "string" },
        "month": { type: "string" },
        "day": { type: "string" },
        "href": { type: "string" }
    },
    required: ["year", "month", "day", "href"],
    additionalProperties: false
}

const createRankingSchema = {
    type: "object",
    properties: {
        "year": { type: "string" }
    },
    required: ["year"],
    additionalProperties: false
}

patchRankingSchema = {
    type: "object",
    properties: {
        "year": { type: "string" },
        "participantId": { type: "string" },
        "resultIndex": { type: "string" },
        "aName": { type: "string" },
        "weight": { type: "string" },
        "points": { type: "string" },
        "func": { type: "string" }
    },
    additionalProperties: false
}


//////////////////////API VALIDATION SCHEMES/////////////////////////////
/////////////////////////////////////////////////////////////////////////

module.exports = {
    rankingImageUploadSchema,
    patchRankingSchema,
    createRankingSchema,
    deleteCompetitionSchema,
    createCompetitionSchema,
    captchaSchema,
    logoDeleteSchema,
    postCreateSchema,
    imageUploadSchema,
    loginSchema,
    saveDescriptionsSchema,
    changeVisibilitySchema,
    publicPostsSchema,
    singlePostSchema
}