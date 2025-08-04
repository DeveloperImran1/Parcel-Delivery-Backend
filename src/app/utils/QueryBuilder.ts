/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { Query } from 'mongoose';
import { excludedField } from '../constants';

// QueryBuilder class for all get method
export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery; // kon collectinon ke find korbo seita asbe. Ex: Tour.find()
    this.query = query; // query hisabe asa object ta asbe. Jar moddhe search, filter, min, max, limit etc sob kisoi thakbe. Ex: { searchTerm: "Dhaka", limit: "10" }
  }

  filter(): this {
    const filter = { ...this.query }; // Ai line er mane holo filter variable er moddhe query er akta copy set kore dissi. Ai qury ba filter er moddhe sokol query ase. So tar moddhe theke jeigulo direct property and value dia filter korte hio. seigulo sara bakiderke delete kore dissa filter object theke. But aita query object ke kono effect felbena. Karon spread operator dia copy kora hoisa.

    for (const field of excludedField) {
      delete filter[field];
    }

    // ager model qury te set hoia ase perameter a asa modelQuery er value Tour.find() akhon aitake abar ager Tour.find() er sathe abar .find(filter) set kortesi. Jar fole filter object er moddhe thaka property and value dia db theke filter kore data get korbe.
    this.modelQuery = this.modelQuery.find(filter); // Ex: Tour.find().find(filter)

    return this;
  }

  search(searchableFields: string[]): this {
    const searchTerm = this.query.searchTerm || '';

    const searchQuery = {
      $or: searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' }, // aikhane field ke property hisabe use korte hole [] array er moddhe likhte hobe.
      })),
    };

    this.modelQuery = this.modelQuery.find(searchQuery);
    return this;
  }

  sort(): this {
    const sort = this?.query?.sort || '-createdAt'; // sort a kono value na asle default value use hobe. Ar sort er value hisabe hobe holo: propertyName. Jei property ke use kore sort kora hobe. Akhon porpertyName er age minus add korle descending ar positive name hole ascending onujaie sort hobe. Aikhane "-createdAt" dara bujhasse time onujaie sobar boro theke soto sort koro.
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }

  fields(): this {
    // field filtering --> jokhon kiso property ke get korte hoi tokhon aita kaje lage.
    const fields = this?.query?.fields?.split(',').join(' ') || ''; // ai fileds variable a jodi akta field name send kori tahole sudho akta field name dilai hobe. Ar jodi akadhik field ke get korte chai tahole comma separete na hoia space separete hobe. Ex: fields = "title location"; But front-end theke comma separete a asbe. Tai split and join use kore space separete kore niasi.
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  paginate(): this {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    const skip = (page - 1) * limit;
    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  build() {
    return this.modelQuery;
  }

  async getMeta() {
    // const totalDocuments = await this.modelQuery.countDocuments();  // Output: Tour.find().countDocuments(); aivabe call hosse. But call howa doekar modelName.countDocuments() tai niche modelQuery theke sudho modelName ke get korese. model property ke chainig er maddhome
    const totalDocuments = await this.modelQuery.model.countDocuments();
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    const totalPage = Math.ceil(totalDocuments / limit);

    return { page, limit, total: totalDocuments, totalPage };
  }
}
