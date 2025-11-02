# 🧪 AgentOps SDK - Test Suite

This folder contains comprehensive tests for the AgentOps SDK with local API integration.

---

## 📁 Files

| File | Purpose |
|------|---------|
| `test_agent.py` | Comprehensive SDK test script (5 test cases) |
| `verify_database.sql` | SQL queries to verify data in Supabase |
| `README.md` | This file |

---

## 🚀 Running the Tests

### **Prerequisites:**
1. ✅ Backend API running at `http://localhost:8000`
2. ✅ Supabase database schema deployed
3. ✅ AgentOps SDK installed or available in parent directory
4. ✅ Environment variables set (`.env` file with OpenAI API key)

### **Step 1: Run the Test Script**

```powershell
# From the test-folder directory
cd test-folder
python test_agent.py
```

This will:
- Connect to your local API
- Run 5 comprehensive tests
- Upload metrics to Supabase
- Show detailed results

### **Step 2: Verify in Supabase**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor**
4. Copy and paste queries from `verify_database.sql`
5. Run them to see your test results!

---

## 🧪 Test Cases

### **Test 1: Simple Factual Question (No-RAG)**
- **Expected**: No hallucination
- **Tests**: Basic factual accuracy

### **Test 2: Uncertain Response**
- **Expected**: High uncertainty score
- **Tests**: Uncertainty language detection

### **Test 3: Clear Hallucination**
- **Expected**: Hallucination detected
- **Tests**: Nonsense question handling

### **Test 4: RAG Mode - Supported**
- **Expected**: High factual support, no hallucination
- **Tests**: Evidence-based grounding

### **Test 5: RAG Mode - Unsupported**
- **Expected**: Low factual support, hallucination detected
- **Tests**: Evidence contradiction detection

---

## 📊 Expected Results

After running the tests, you should see:
- **5 evaluations** stored in database
- **2-3 hallucinations** detected
- **Average latency** around 1-2 seconds
- **Metrics** aggregated in `agent_stats` view

---

## 🔍 SQL Queries Guide

The `verify_database.sql` file contains **15 comprehensive queries**:

1. **Query 1-4**: Basic data checks (agents, keys, evals)
2. **Query 5**: Agent statistics summary
3. **Query 6-8**: Hallucination analysis
4. **Query 9**: Performance metrics
5. **Query 10-14**: Detailed breakdowns
6. **Query 15**: Overall summary

---

## ✅ Success Criteria

Your tests are successful if:
- ✅ All 5 tests complete without errors
- ✅ Data appears in Supabase `evals` table
- ✅ Hallucinations are correctly detected
- ✅ Metrics are reasonable (latency < 5s)
- ✅ Agent stats view shows correct aggregations

---

## 🐛 Troubleshooting

### **Error: "Unable to connect to the remote server"**
- Check if API is running: `http://localhost:8000/health`
- Restart the API server if needed

### **Error: "ModuleNotFoundError: No module named 'agentops'"**
- Install SDK: `pip install -e ../agentops-client`
- Or ensure parent directory is in Python path

### **Error: "ModuleNotFoundError: No module named 'openai'"**
- Install OpenAI: `pip install openai python-dotenv`
- Make sure `.env` file exists in parent directory

### **No data in Supabase**
- Check API logs for errors
- Verify API key is correct
- Test API manually with curl

---

## 📈 Next Steps

After successful testing:
1. ✅ Verify data in Supabase
2. ✅ Review hallucination detection accuracy
3. ✅ Check performance metrics
4. 🚀 Deploy API to GCP Cloud Run
5. 🌐 Update SDK to use production URL

---

## 🎯 API Configuration

**Current Setup:**
- **API URL**: `http://localhost:8000`
- **Agent ID**: `f22c667e-9dd2-4314-9f0b-424b808a0f33`
- **API Key**: `agentops_PkhON27-mBYG77Ou1OKIjCvyqetYkXNllpLKVoaE4RY`

**For Production:**
Update `API_URL` in `test_agent.py` to your GCP Cloud Run URL after deployment.

---

## 📞 Support

For issues:
- Check the main `README.md` in project root
- Review `API_WORKING.md` for API status
- See `COMPLETE_SUCCESS.md` for full documentation

---

**Happy Testing!** 🧪✨

