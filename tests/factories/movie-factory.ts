import { faker } from "@faker-js/faker";


export function makeFakeOpenMovie() {
    return {
        id: faker.number.int(2),
        name: faker.music.songName(),
        adultsOnly: false,
        rentalId: null
    }
}

export function makeFakeRentedMovie() {
    return {
        id: faker.number.int(2),
        name: faker.music.songName(),
        adultsOnly: false,
        rentalId: 7
    }
}