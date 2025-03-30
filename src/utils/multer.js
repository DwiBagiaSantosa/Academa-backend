import multer from "multer";

export const fileStorageCourse =  multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,"public/uploads/courses")
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.')[1]
        const uniqId = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        cb(null, `${file.fieldname}-${uniqId}.${ext}`)
    }
})

export const fileStorage = (path = 'courses') =>  multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `public/uploads/${path}`)
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.')[1]
        const uniqId = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        cb(null, `${file.fieldname}-${uniqId}.${ext}`)
    }
})

export const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}