import { faker } from "@faker-js/faker";

export function makeFakeAdultUser() {
    return {
        id: faker.number.int(2),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        cpf: faker.string.numeric(11),
        birthDate: faker.date.past({refDate: '2001-01-01T00:00:00.000Z' })
    }
}