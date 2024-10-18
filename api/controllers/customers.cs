using System.Diagnostics;
using api.data.context;
using api.data.models;
using Microsoft.AspNetCore.Mvc;

namespace api.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController(AppDbContext context) : ControllerBase
    {
        private readonly AppDbContext _context = context;

        [HttpGet("list")]
        public IActionResult List([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var customers = _context.Customers
                .OrderBy(c => c.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(customers);
        }

        [HttpPost("generate")]
        public IActionResult GenerateCustomers([FromQuery] int count)
        {
            var faker = new Bogus.Faker();
            var customers = new List<Customer>();

            string[] ignoreProps = ["Id", "CreatedOn", "LastUpdatedOn"];

            for (int i = 0; i < count; i++)
            {
                var customer = new Customer();

                foreach (var prop in typeof(Customer).GetProperties())
                {
                    if (prop.CanWrite && !ignoreProps.Contains(prop.Name))
                    {
                        object value = prop.PropertyType switch
                        {
                            Type t when t == typeof(string) =>
                                prop.Name.Contains("Email") ? faker.Internet.Email() : faker.Name.FirstName() + " " + faker.Name.LastName(),
                            Type t when t == typeof(DateTime) =>
                                faker.Date.Recent(),
                            _ => throw new InvalidOperationException($"Unsupported property type: {prop.PropertyType} at {prop.Name}")
                        };

                        prop.SetValue(customer, value);
                    }
                }

                customers.Add(customer);
                _context.Customers.Add(customer);
            }

            _context.SaveChanges();

            return Ok(customers);
        }

        [HttpPost("update")]
        public async Task<IActionResult> UpdateCustomer([FromBody] Customer updatedCustomer)
        {
            if (updatedCustomer.Id == null)
            {
                updatedCustomer.LastUpdatedOn = DateTime.Now;
                _context.Customers.Add(updatedCustomer);
                await _context.SaveChangesAsync();

                return Ok(updatedCustomer);
            }
            var existingCustomer = await _context.Customers.FindAsync(updatedCustomer.Id);
            if (existingCustomer == null)
            {
                // return NotFound("Customer not found");
                return NotFound("Customer not found!");
            }

            // Compare and update only changed properties
            foreach (var property in typeof(Customer).GetProperties())
            {
                // Skip the ID field, we don't want to update it
                if (property.Name == "Id")
                    continue;

                var updatedValue = property.GetValue(updatedCustomer);
                var existingValue = property.GetValue(existingCustomer);

                // Update the property if the value has changed and is not null
                if (updatedValue != null && !updatedValue.Equals(existingValue))
                {
                    property.SetValue(existingCustomer, updatedValue);
                }
            }
            existingCustomer.LastUpdatedOn = DateTime.Now;

            // Save changes to the database
            _context.Customers.Update(existingCustomer);
            await _context.SaveChangesAsync();

            return Ok(existingCustomer);
        }

    }
}