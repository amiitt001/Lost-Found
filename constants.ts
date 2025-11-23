import { Item, ItemType } from './types';

export const CATEGORIES = [
  "Electronics",
  "Keys",
  "Wallet/Purse",
  "Clothing",
  "Pets",
  "Documents",
  "Jewelry",
  "Accessories",
  "Other"
];

export const MOCK_ITEMS: Item[] = [
  {
    id: '1',
    type: ItemType.LOST,
    title: 'Golden Retriever - "Buddy"',
    description: 'Lost near Central Park. He is very friendly, wearing a red collar. Answers to Buddy.',
    category: 'Pets',
    location: 'Central Park, NY',
    date: '2023-10-25',
    imageUrl: 'https://picsum.photos/id/237/400/300',
    contactName: 'John Doe',
    status: 'OPEN'
  },
  {
    id: '2',
    type: ItemType.FOUND,
    title: 'Black Leather Wallet',
    description: 'Found on the bus (Route 42). Contains some cash but no ID cards. Has a small scratch on the corner.',
    category: 'Wallet/Purse',
    location: 'Downtown Bus Stop',
    date: '2023-10-26',
    imageUrl: 'https://picsum.photos/id/443/400/300',
    contactName: 'Jane Smith',
    status: 'OPEN'
  },
  {
    id: '3',
    type: ItemType.LOST,
    title: 'MacBook Pro 14"',
    description: 'Silver MacBook Pro left in a coffee shop. Has a sticker of a cat on the lid.',
    category: 'Electronics',
    location: 'Bean & Brew Cafe',
    date: '2023-10-24',
    imageUrl: 'https://picsum.photos/id/0/400/300',
    contactName: 'Mike Ross',
    status: 'OPEN'
  },
  {
    id: '4',
    type: ItemType.FOUND,
    title: 'Car Keys (Toyota)',
    description: 'Set of keys with a Toyota fob and a blue keychain found on the sidewalk.',
    category: 'Keys',
    location: 'Main Street',
    date: '2023-10-27',
    imageUrl: 'https://picsum.photos/id/133/400/300',
    contactName: 'Sarah Connor',
    status: 'OPEN'
  },
  {
    id: '5',
    type: ItemType.FOUND,
    title: 'Golden Retriever Dog',
    description: 'Found wandering near the park entrance. Very friendly, red collar.',
    category: 'Pets',
    location: 'Central Park West',
    date: '2023-10-25',
    imageUrl: 'https://picsum.photos/id/237/400/300',
    contactName: 'Park Ranger',
    status: 'OPEN'
  }
];